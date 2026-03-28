package com.itsm.system.domain.code;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommonCodeRepository extends JpaRepository<CommonCode, Long> {
    List<CommonCode> findByGroupIdOrderBySortOrderAsc(String groupId);
    Optional<CommonCode> findByGroupIdAndCodeId(String groupId, String codeId);
    boolean existsByGroupIdAndCodeId(String groupId, String codeId);
}
