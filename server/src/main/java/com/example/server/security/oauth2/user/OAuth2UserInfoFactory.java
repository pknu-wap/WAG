package com.example.server.security.oauth2.user;

import com.example.server.exception.OAuth2AuthenticationProcessingException;
import com.example.server.domain.AuthProvider;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(OAuth2UserRequest oAuth2UserRequest, Map<String, Object> attributes) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();

        if(registrationId.equalsIgnoreCase(AuthProvider.google.toString())) {
            return new GoogleOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase(AuthProvider.facebook.toString())) {
            return new FacebookOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase(AuthProvider.github.toString())) {
            if(attributes.get("email")==null){
                 return new GithubOAuth2UserInfo(setAttributesGithubEmail(attributes,oAuth2UserRequest.getAccessToken().getTokenValue()));
            }
            return new GithubOAuth2UserInfo(attributes);
        }  else if (registrationId.equalsIgnoreCase(AuthProvider.kakao.toString())) {
            return makeKakaoUserInfo(attributes);
        }  else if (registrationId.equalsIgnoreCase(AuthProvider.naver.toString())) {
            return makeNaverUserInfo(attributes);
        } else {
            throw new OAuth2AuthenticationProcessingException("Sorry! Login with " + registrationId + " is not supported yet.");
        }
    }

    public static OAuth2UserInfo makeKakaoUserInfo(Map<String, Object> attributes){
        Map<String, Object> kakaoUserInfo = new HashMap<>();
        kakaoUserInfo.put("id", String.valueOf(attributes.get("id")));
        LinkedHashMap<String, Object> temporaryProperties = (LinkedHashMap<String, Object>) attributes.get("properties");
        kakaoUserInfo.put("nickname", temporaryProperties.get("nickname"));
        kakaoUserInfo.put("picture", temporaryProperties.get("profile_image"));
        LinkedHashMap<String, Object> temporaryProperties2 = (LinkedHashMap<String, Object>) attributes.get("kakao_account");
        kakaoUserInfo.put("email", temporaryProperties2.get("email"));

        return new KakaoOAuth2UserInfo(kakaoUserInfo);
    }

    public static OAuth2UserInfo makeNaverUserInfo(Map<String, Object> attributes){
        Map<String, Object> naverUserInfo = new HashMap<>();
        LinkedHashMap<String, Object> temporaryProperties = (LinkedHashMap<String, Object>) attributes.get("response");
        naverUserInfo.put("id", String.valueOf(temporaryProperties.get("id")));
        naverUserInfo.put("nickname", temporaryProperties.get("nickname"));
        naverUserInfo.put("picture", temporaryProperties.get("profile_image"));
        naverUserInfo.put("email", temporaryProperties.get("email"));

        return new NaverOAuth2UserInfo(naverUserInfo);
    }

    public static Map<String, Object> setAttributesGithubEmail(Map<String, Object> attributes, String accessToken){
        String email = getGithubEmail(accessToken);
        Map<String, Object> modifiedAttributes = new HashMap<>(attributes);
        modifiedAttributes.replace("email", email);
        return Collections.unmodifiableMap(new LinkedHashMap<>(modifiedAttributes));
    }

    public static String getGithubEmail(String accessToken){
        RestTemplate restTemplate = new RestTemplate();
        String api_url = "https://api.github.com/user/emails";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer "+accessToken);
        HttpEntity request = new HttpEntity(headers);

        ResponseEntity<GithubEmailInfo[]> response = restTemplate.exchange(
                api_url,
                HttpMethod.GET,
                request,
                GithubEmailInfo[].class);

        return response.getBody()[0].getEmail();
    }
}
