<img src="https://capsule-render.vercel.app/api?type=waving&color=B931FC&height=150&section=header&text=&fontSize=0" />

# WAG - Web Appends Game

![WAG_LOGO_Dark](https://github.com/pknu-wap/WAG/assets/112786665/e0d26e4f-16e4-4a81-adaf-adb5f77e86c4)

## 🌱 Introduction  


간편하고 빠르게 즐길 수 있는 실시간 채팅기반 웹 미니게임을 제작하는 WAG 입니다!
<br>
<br>
<br>

---
## 📚 Stack
### Front End
<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">

### Back End
<img src="https://img.shields.io/badge/spring boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"><img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white"> 

### Coop&Deploy
<img src="https://img.shields.io/badge/notion-000000?style=for-the-badge&logo=notion&logoColor=white"> <img src="https://img.shields.io/badge/figma-E7157B?style=for-the-badge&logo=figma&logoColor=white"> <img src="https://img.shields.io/badge/github-000000?style=for-the-badge&logo=github&logoColor=white">

<br>

---

## 💪 Contributor

|  <img src="https://avatars.githubusercontent.com/u/112786665?v=4" alt="3_pano" width="120" height="120">  | <img src="https://avatars.githubusercontent.com/u/80705329?v=4" alt="3_jumo" width="120" height="120"> | <img src="https://avatars.githubusercontent.com/u/111286262?v=4" alt="3_simba" width="120" height="120">  | <img src="https://avatars.githubusercontent.com/u/35947667?v=4" alt="3_pano" width="120" height="120"> | <img src="https://avatars.githubusercontent.com/u/130421104?v=4" alt="3_miki" width="120" height="120"> |
| :------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------: |
|  [김준서](https://github.com/oesnuj)   |    [하준서](https://github.com/dev-junseo)     |    [김종경](https://github.com/JONG-KYEONG)   |     [장홍준](https://github.com/wkdghdwns199)   |      [함규빈](https://github.com/PororoAndFriends)      |
| Front-End |  Front-End |  Back-End  |  Back-End |  Back-End

<br>

---

## 🚥 Git Flow
기본적으로 Git Flow 전략을 이용합니다. 작업 시작 시 선행되어야 할 작업은 다음과 같습니다.

```gradle
1. Issue를 생성한다.
2. feature Branch를 생성한다.
3. Add - Commit - Push - Pull Request 의 과정을 거친다.
4. merge된 작업이 있을 경우, 다른 브랜치에서 작업을 진행 중이던 개발자는 본인의 브랜치로 merge된 작업을 Pull 받아온다.
5. 종료된 Issue와 Pull Request의 Label과 Project를 관리한다.
```

### Branch Convention

```yaml
- [release] : 현재 배포 중인 브랜치
- [develop] : 배포되기 직전 테스트 단계의 브랜치
- [feature] : 기능 추가
- [fix] : 에러 수정, 버그 수정
- [docs] : README, 문서
- [refactor] : 코드 리펙토링 (기능 변경 없이 코드만 수정할 때)
- [modify] : 코드 수정 (기능의 변화가 있을 때)
- [chore] : gradle 세팅, 위의 것 이외에 거의 모든 것
```

### Issue Template
```text
## 💥이슈 설명

## 📚할 일 목록

## 👀참고 사항

## ⌛기한

```

### Pr Template
```text
### PR 타입(하나 이상의 PR 타입을 선택해주세요)
- [ ] 기능 추가 ✨
- [ ] 기능 삭제 🔥
- [ ] 버그 수정 🐛
- [ ] 코드 형태 개선 🎨
- [ ] 의존성, 환경 변수, 빌드 관련 코드 업데이트 🔨

### 변경 사항
ex) 로그인 시, 구글 소셜 로그인 기능을 추가했습니다.

### 이슈 사항
ex) 베이스 브랜치에 포함되기 위한 코드는 모두 정상적으로 동작해야 합니다. 결과물에 대한 스크린샷, GIF, 혹은 라이브 데모가 가능하도록 샘플API를 첨부할 수도 있습니다.

### To reviewer
ex) 여기에서 이 부분 잘 모르겠는데 한번 봐주실 수 있나요?
```
