package com.itsm.system.service.operator;

import com.itsm.system.domain.code.CommonCodeRepository;
import com.itsm.system.domain.operator.Operator;
import com.itsm.system.domain.operator.OperatorCompany;
import com.itsm.system.domain.operator.OperatorTeam;
import com.itsm.system.dto.operator.OperatorCompanyDTO;
import com.itsm.system.dto.operator.OperatorDTO;
import com.itsm.system.repository.operator.OperatorCompanyRepository;
import com.itsm.system.repository.operator.OperatorRepository;
import com.itsm.system.repository.operator.OperatorTeamRepository;
import com.itsm.system.repository.operator.mapping.OperatorTeamMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OperatorServiceTest {

    @Mock
    private OperatorCompanyRepository companyRepository;
    @Mock
    private OperatorTeamRepository teamRepository;
    @Mock
    private OperatorRepository operatorRepository;
    @Mock
    private OperatorTeamMemberRepository teamMemberRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private CommonCodeRepository commonCodeRepository;

    @InjectMocks
    private OperatorService operatorService;

    private OperatorCompany company;
    private OperatorTeam team;
    private Operator operator;

    @BeforeEach
    void setUp() {
        company = OperatorCompany.builder()
                .id(1L)
                .operatorCompanyId("MSP-01")
                .name("Test Company")
                .build();

        team = OperatorTeam.builder()
                .id(1L)
                .operatorCompany(company)
                .name("Ops Team")
                .build();

        operator = Operator.builder()
                .id(1L)
                .userId("admin")
                .password("encoded_pass")
                .name("Admin User")
                .role("ROLE_OPER")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("운영사 생성 시 중복 ID가 있으면 예외가 발생한다")
    void createCompany_DuplicateId_ThrowsException() {
        // given
        OperatorCompanyDTO dto = OperatorCompanyDTO.builder()
                .operatorCompanyId("MSP-01")
                .name("New Company")
                .build();
        when(companyRepository.existsByOperatorCompanyId("MSP-01")).thenReturn(true);

        // when & then
        assertThatThrownBy(() -> operatorService.createCompany(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("운영자 정보 수정 시 비밀번호를 입력하면 인코딩되어 저장된다")
    void updateOperator_WithPassword_EncodesPassword() {
        // given
        OperatorDTO dto = OperatorDTO.builder()
                .name("Updated Name")
                .password("new_pass")
                .build();
        
        when(operatorRepository.findById(1L)).thenReturn(Optional.of(operator));
        when(passwordEncoder.encode("new_pass")).thenReturn("encoded_new_pass");
        when(operatorRepository.save(any(Operator.class))).thenAnswer(i -> i.getArguments()[0]);

        // when
        OperatorDTO result = operatorService.updateOperator(1L, dto);

        // then
        assertThat(result.getName()).isEqualTo("Updated Name");
        verify(passwordEncoder).encode("new_pass");
        assertThat(operator.getPassword()).isEqualTo("encoded_new_pass");
    }

    @Test
    @DisplayName("운영자 정보 수정 시 비밀번호가 없으면 기존 비밀번호를 유지한다")
    void updateOperator_WithoutPassword_KeepsOldPassword() {
        // given
        OperatorDTO dto = OperatorDTO.builder()
                .name("Updated Name")
                .build();
        String oldPass = operator.getPassword();
        
        when(operatorRepository.findById(1L)).thenReturn(Optional.of(operator));
        when(operatorRepository.save(any(Operator.class))).thenAnswer(i -> i.getArguments()[0]);

        // when
        operatorService.updateOperator(1L, dto);

        // then
        assertThat(operator.getPassword()).isEqualTo(oldPass);
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("운영사 삭제 시 소속된 팀들도 함께 삭제 처리가 진행된다")
    void deleteCompany_CascadesToTeams() {
        // given
        java.util.List<OperatorTeam> teams = java.util.List.of(team);
        when(teamRepository.findByOperatorCompany_Id(1L)).thenReturn(teams);

        // when
        operatorService.deleteCompany(1L, false);

        // then
        verify(teamRepository).deleteById(1L); // deleteTeam inside deleteCompany
        verify(companyRepository).deleteById(1L);
    }
}
