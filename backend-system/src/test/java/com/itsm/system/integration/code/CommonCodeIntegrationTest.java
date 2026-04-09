package com.itsm.system.integration.code;

import com.itsm.system.dto.code.CodeGroupDTO;
import com.itsm.system.dto.code.CommonCodeDTO;
import com.itsm.system.exception.BusinessException;
import com.itsm.system.service.code.CommonCodeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class CommonCodeIntegrationTest {

    @Autowired
    private CommonCodeService commonCodeService;

    @Test
    @DisplayName("공통 코드 그룹 및 코드 항목 연쇄 생성 및 조회 통합 테스트")
    void commonCodeLifecycle_Integration_Success() {
        // 1. Create Group
        String groupId = "PRIORITY";
        CodeGroupDTO groupDto = CodeGroupDTO.builder()
                .groupId(groupId)
                .name("우선순위")
                .description("업무 우선순위")
                .isSystem(false)
                .build();
        
        CodeGroupDTO savedGroup = commonCodeService.createGroup(groupDto);
        assertThat(savedGroup.getGroupId()).isEqualTo(groupId);

        // 2. Create Code in Group
        CommonCodeDTO highCode = CommonCodeDTO.builder()
                .groupId(groupId)
                .codeId("HIGH")
                .codeName("높음")
                .sortOrder(1)
                .isActive(true)
                .build();
        
        CommonCodeDTO savedCode = commonCodeService.createCode(highCode);
        assertThat(savedCode.getId()).isNotNull();
        assertThat(savedCode.getCodeName()).isEqualTo("높음");

        // 3. Retrieve All Codes in Group
        List<CommonCodeDTO> codes = commonCodeService.getCodesByGroup(groupId);
        assertThat(codes).hasSize(1);
        assertThat(codes.get(0).getCodeId()).isEqualTo("HIGH");
    }

    @Test
    @DisplayName("공통 코드 그룹 조회 - 성공")
    void getGroup_ValidId_ReturnsDto() {
        // given
        String groupId = "GET_GROUP";
        commonCodeService.createGroup(CodeGroupDTO.builder()
                .groupId(groupId)
                .name("조회그룹")
                .build());

        // when
        CodeGroupDTO result = commonCodeService.getGroup(groupId);

        // then
        assertThat(result.getGroupId()).isEqualTo(groupId);
        assertThat(result.getName()).isEqualTo("조회그룹");
    }

    @Test
    @DisplayName("존재하지 않는 코드 그룹 조회 - 예외 발생")
    void getGroup_NotFound_ThrowsNotFound() {
        assertThatThrownBy(() -> commonCodeService.getGroup("NON_EXISTENT"))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getStatus())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("코드 그룹 수정 - 성공")
    void updateGroup_ValidDto_ReturnsUpdatedDto() {
        // given
        String groupId = "UPDATE_GROUP";
        commonCodeService.createGroup(CodeGroupDTO.builder()
                .groupId(groupId)
                .name("수정전")
                .build());

        CodeGroupDTO updateDto = CodeGroupDTO.builder()
                .name("수정후")
                .description("설명수정")
                .build();

        // when
        CodeGroupDTO result = commonCodeService.updateGroup(groupId, updateDto);

        // then
        assertThat(result.getName()).isEqualTo("수정후");
        assertThat(result.getDescription()).isEqualTo("설명수정");
    }

    @Test
    @DisplayName("코드 그룹 삭제 - 성공")
    void deleteGroup_ValidId_Success() {
        // given
        String groupId = "DELETE_GROUP";
        commonCodeService.createGroup(CodeGroupDTO.builder()
                .groupId(groupId)
                .name("삭제제품")
                .isSystem(false)
                .build());

        // when
        commonCodeService.deleteGroup(groupId);

        // then
        assertThatThrownBy(() -> commonCodeService.getGroup(groupId))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getStatus())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("시스템 그룹 삭제 시도시 예외 발생 검증")
    void deleteGroup_SystemGroup_ThrowsForbidden() {
        // given
        String systemGroupId = "SYS_STATUS";
        CodeGroupDTO systemGroup = CodeGroupDTO.builder()
                .groupId(systemGroupId)
                .name("시스템상태")
                .isSystem(true)
                .build();
        commonCodeService.createGroup(systemGroup);

        // when & then
        assertThatThrownBy(() -> commonCodeService.deleteGroup(systemGroupId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("System group cannot be deleted")
                .extracting(e -> ((BusinessException) e).getStatus())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("중복 데이터 생성 시도 시 Conflict 예외 발생 검증")
    void createGroup_DuplicateId_ThrowsConflict() {
        // given
        String groupId = "DUPLICATE";
        CodeGroupDTO group = CodeGroupDTO.builder()
                .groupId(groupId)
                .name("중복그룹")
                .build();
        commonCodeService.createGroup(group);

        // when & then
        assertThatThrownBy(() -> commonCodeService.createGroup(group))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists")
                .extracting(e -> ((BusinessException) e).getStatus())
                .isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("공통 코드 수정 - 성공")
    void updateCode_ValidDto_Success() {
        // given
        String groupId = "CODE_GRP";
        commonCodeService.createGroup(CodeGroupDTO.builder().groupId(groupId).name("그룹").build());
        
        CommonCodeDTO codeDto = commonCodeService.createCode(CommonCodeDTO.builder()
                .groupId(groupId)
                .codeId("C1")
                .codeName("코드1")
                .build());

        CommonCodeDTO updateDto = CommonCodeDTO.builder()
                .codeName("수정코드")
                .sortOrder(10)
                .isActive(false)
                .build();

        // when
        CommonCodeDTO result = commonCodeService.updateCode(codeDto.getId(), updateDto);

        // then
        assertThat(result.getCodeName()).isEqualTo("수정코드");
        assertThat(result.getSortOrder()).isEqualTo(10);
        assertThat(result.getIsActive()).isFalse();
    }

    @Test
    @DisplayName("중복 코드 생성 시도 시 Conflict 예외 발생 검증")
    void createCode_DuplicateId_ThrowsConflict() {
        // given
        String groupId = "DUP_CODE_GRP";
        commonCodeService.createGroup(CodeGroupDTO.builder().groupId(groupId).name("그룹").build());
        
        CommonCodeDTO codeDto = CommonCodeDTO.builder()
                .groupId(groupId)
                .codeId("DUP")
                .codeName("중복")
                .build();
        commonCodeService.createCode(codeDto);

        // when & then
        assertThatThrownBy(() -> commonCodeService.createCode(codeDto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists")
                .extracting(e -> ((BusinessException) e).getStatus())
                .isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("공통 코드 삭제 - 성공")
    void deleteCode_ValidId_Success() {
        // given
        String groupId = "DEL_CODE_GRP";
        commonCodeService.createGroup(CodeGroupDTO.builder().groupId(groupId).name("그룹").build());
        
        CommonCodeDTO codeDto = commonCodeService.createCode(CommonCodeDTO.builder()
                .groupId(groupId)
                .codeId("DEL")
                .codeName("삭제")
                .build());

        // when
        commonCodeService.deleteCode(codeDto.getId());

        // then
        List<CommonCodeDTO> codes = commonCodeService.getCodesByGroup(groupId);
        assertThat(codes).isEmpty();
    }
}
