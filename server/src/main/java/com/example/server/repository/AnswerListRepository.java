package com.example.server.repository;

import com.example.server.domain.AnswerList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerListRepository extends JpaRepository<AnswerList, Long> {
    @Query("SELECT al FROM AnswerList al WHERE al.answerGroup = :group order by RAND() limit 6")
    List<AnswerList> findAnswerListByGroup(@Param("group") String group);

    @Query("SELECT al FROM AnswerList al order by RAND() limit 6")
    List<AnswerList> findAnswerListBy();

    /** 여러 카테고리를 합쳐서 랜덤으로 뽑는다 (카테고리 복수 선택) */
    @Query("SELECT al FROM AnswerList al WHERE al.answerGroup IN :groups order by RAND() limit 6")
    List<AnswerList> findAnswerListByGroups(@Param("groups") List<String> groups);

    @Query("SELECT DISTINCT al.answerGroup FROM AnswerList al ORDER BY al.answerGroup")
    List<String> findDistinctGroups();
    @Query("SELECT al FROM AnswerList al WHERE al.answerGroup = :group order by al.id asc limit 1")
    Optional<AnswerList> haveCategory(@Param("group") String group);
}
