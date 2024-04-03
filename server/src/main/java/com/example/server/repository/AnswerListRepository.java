package com.example.server.repository;

import com.example.server.domain.AnswerList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerListRepository extends JpaRepository<AnswerList, Long> {
    @Query("SELECT al FROM AnswerList al WHERE al.answerGroup = : group order by RAND() limit 6")
    List<AnswerList> findAnswerListByGroup(@Param("group") String group);

    @Query("SELECT al FROM AnswerList al order by RAND() limit 6")
    List<AnswerList> findAnswerListBy();
}
