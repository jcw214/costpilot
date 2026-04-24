package com.costpilot.global.init;

import com.costpilot.organization.domain.*;
import com.costpilot.organization.port.out.*;
import com.costpilot.auth.adapter.persistence.JpaUserRepository;
import com.costpilot.auth.domain.AppUser;
import com.costpilot.auth.domain.RoleType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

import com.costpilot.timesheet.domain.*;
import com.costpilot.timesheet.adapter.persistence.*;
import com.costpilot.expense.domain.*;
import com.costpilot.expense.adapter.persistence.*;
import com.costpilot.budget.domain.*;
import com.costpilot.budget.adapter.persistence.*;
import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final JobGradeRepository jobGradeRepository;
    private final ProjectTypeRepository projectTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;

    private final JpaTimeEntryRepository timeEntryRepository;
    private final JpaDirectExpenseRepository directExpenseRepository;
    private final JpaOverheadExpenseRepository overheadExpenseRepository;
    private final JpaStandardCostRateRepository standardCostRateRepository;
    private final JpaBudgetPlanRepository budgetPlanRepository;
    private final JpaUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.init.admin-password:changeme}")
    private String initPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (departmentRepository.count() == 0) {
            List<Department> departments = initDepartments();
            List<JobGrade> jobGrades = initJobGrades();
            List<ProjectType> projectTypes = initProjectTypes();
            List<Employee> employees = initEmployees(departments, jobGrades);
            List<Project> projects = initProjects(departments, projectTypes);
        }

        // ── 기본 사용자 시딩 ──
        if (userRepository.count() == 0) {
            initUsers();
        }

        List<Department> departments = departmentRepository.findAll();
        List<JobGrade> jobGrades = jobGradeRepository.findAll();
        List<ProjectType> projectTypes = projectTypeRepository.findAll();
        List<Employee> employees = employeeRepository.findAll();
        List<Project> projects = projectRepository.findAll();

        if (standardCostRateRepository.count() == 0) {
            initStandardCostRates(projectTypes, jobGrades);
        }
        if (budgetPlanRepository.count() == 0) {
            initBudgetPlans(projects);
        }
        if (overheadExpenseRepository.count() == 0) {
            initOverheadExpenses(departments);
        }
        if (directExpenseRepository.count() == 0) {
            initDirectExpenses(projects);
        }
        if (timeEntryRepository.count() == 0) {
            initTimeEntries(employees, projects);
        }

        log.info("=== Mock Data 초기화 완료 ===");
    }

    // ── 1. 본부 5개 (수익 3 + 지원 2) ─────────────────────────────
    private List<Department> initDepartments() {
        List<Department> departments = List.of(
                Department.builder().name("솔루션개발본부").type(DepartmentType.수익).build(),
                Department.builder().name("시스템운영본부").type(DepartmentType.수익).build(),
                Department.builder().name("컨설팅사업본부").type(DepartmentType.수익).build(),
                Department.builder().name("경영지원본부").type(DepartmentType.지원).build(),
                Department.builder().name("기술인프라본부").type(DepartmentType.지원).build()
        );
        departments.forEach(departmentRepository::save);
        return departments;
    }

    // ── 2. 직급 5개 ─────────────────────────────────────────────
    private List<JobGrade> initJobGrades() {
        List<JobGrade> jobGrades = List.of(
                JobGrade.builder().code("G1").name("사원").standardHourlyRate(25000).build(),
                JobGrade.builder().code("G2").name("대리").standardHourlyRate(35000).build(),
                JobGrade.builder().code("G3").name("과장/선임").standardHourlyRate(45000).build(),
                JobGrade.builder().code("G4").name("차장/책임").standardHourlyRate(55000).build(),
                JobGrade.builder().code("G5").name("부장/수석").standardHourlyRate(70000).build()
        );
        return jobGradeRepository.saveAll(jobGrades);
    }

    // ── 3. 프로젝트 유형 7개 ────────────────────────────────────
    private List<ProjectType> initProjectTypes() {
        List<ProjectType> projectTypes = List.of(
                ProjectType.builder().name("SI 신규개발 (대형)").build(),
                ProjectType.builder().name("SI 신규개발 (중형)").build(),
                ProjectType.builder().name("패키지 커스터마이징").build(),
                ProjectType.builder().name("SM 유지보수").build(),
                ProjectType.builder().name("운영대행").build(),
                ProjectType.builder().name("ISP/BPR 컨설팅").build(),
                ProjectType.builder().name("PMO").build()
        );
        return projectTypeRepository.saveAll(projectTypes);
    }

    // ── 4. 인력 80명 ────────────────────────────────────────────
    private List<Employee> initEmployees(List<Department> departments, List<JobGrade> jobGrades) {
        // 본부별 인원 배분: 솔루션30, 시스템18, 컨설팅12, 경영지원10, 기술인프라10
        int[] deptCounts = {30, 18, 12, 10, 10};
        // 직급별 비율: G1(20%), G2(25%), G3(30%), G4(15%), G5(10%)
        double[] gradeRatios = {0.20, 0.25, 0.30, 0.15, 0.10};

        // 한국 성씨와 이름 풀
        String[] lastNames = {"김", "이", "박", "최", "정", "강", "조", "윤", "장", "임",
                "한", "오", "서", "신", "권", "황", "안", "송", "류", "홍"};
        String[] firstNames = {"민수", "영희", "철수", "지은", "현우", "미영", "준호", "수진", "동현", "혜진",
                "성민", "유진", "재원", "소영", "태호", "은지", "상훈", "지현", "진우", "나연",
                "세훈", "다은", "정훈", "하영", "승우", "예진", "건우", "서연", "대훈", "채원"};

        // 실제시급 범위 (표준 ± 변동)
        int[][] rateRanges = {
                {22000, 28000},   // G1: 사원
                {32000, 39000},   // G2: 대리
                {42000, 50000},   // G3: 과장/선임
                {50000, 62000},   // G4: 차장/책임
                {65000, 80000}    // G5: 부장/수석
        };

        Random random = new Random(42); // 시드 고정으로 일관된 데이터 생성
        List<Employee> allEmployees = new ArrayList<>();
        int nameIdx = 0;

        for (int deptIdx = 0; deptIdx < departments.size(); deptIdx++) {
            Department dept = departments.get(deptIdx);
            int totalForDept = deptCounts[deptIdx];

            // 직급별 인원 산출
            int[] gradeCounts = distributeByRatio(totalForDept, gradeRatios);

            for (int gradeIdx = 0; gradeIdx < jobGrades.size(); gradeIdx++) {
                JobGrade grade = jobGrades.get(gradeIdx);
                for (int i = 0; i < gradeCounts[gradeIdx]; i++) {
                    String name = lastNames[nameIdx % lastNames.length]
                            + firstNames[nameIdx % firstNames.length];
                    int hourlyRate = rateRanges[gradeIdx][0]
                            + random.nextInt(rateRanges[gradeIdx][1] - rateRanges[gradeIdx][0] + 1);

                    allEmployees.add(Employee.builder()
                            .name(name)
                            .department(dept)
                            .jobGrade(grade)
                            .hourlyRate(hourlyRate)
                            .build());
                    nameIdx++;
                }
            }
        }

        return employeeRepository.saveAll(allEmployees);
    }

    // ── 5. 프로젝트 20개 ────────────────────────────────────────
    private List<Project> initProjects(List<Department> departments, List<ProjectType> projectTypes) {
        // 수익본부(0,1,2)에만 프로젝트 할당. 솔루션8, 시스템7, 컨설팅5
        List<Project> projects = new ArrayList<>();

        // 솔루션개발본부 (8개)
        Department sol = departments.get(0);
        projects.add(buildProject("A은행 차세대 시스템 구축", sol, projectTypes.get(0),
                ProjectStatus.진행중, 800_000_000L, "2026-01-06", "2026-06-30"));
        projects.add(buildProject("B증권 포트폴리오 관리 시스템", sol, projectTypes.get(0),
                ProjectStatus.진행중, 650_000_000L, "2026-01-13", "2026-07-31"));
        projects.add(buildProject("C보험 계약관리 플랫폼", sol, projectTypes.get(1),
                ProjectStatus.진행중, 350_000_000L, "2026-02-03", "2026-06-30"));
        projects.add(buildProject("D제약 영업관리 시스템", sol, projectTypes.get(1),
                ProjectStatus.진행중, 280_000_000L, "2026-01-20", "2026-05-30"));
        projects.add(buildProject("E유통 POS 연동 개발", sol, projectTypes.get(2),
                ProjectStatus.진행중, 200_000_000L, "2026-02-10", "2026-04-30"));
        projects.add(buildProject("F공공 전자결재 시스템", sol, projectTypes.get(1),
                ProjectStatus.진행중, 420_000_000L, "2026-01-06", "2026-08-31"));
        projects.add(buildProject("G교육 LMS 플랫폼", sol, projectTypes.get(2),
                ProjectStatus.완료, 180_000_000L, "2025-09-01", "2026-01-31"));
        projects.add(buildProject("H물류 WMS 모바일앱", sol, projectTypes.get(1),
                ProjectStatus.진행중, 300_000_000L, "2026-03-03", "2026-08-30"));

        // 시스템운영본부 (7개)
        Department sys = departments.get(1);
        projects.add(buildProject("I건설 ERP 유지보수", sys, projectTypes.get(3),
                ProjectStatus.진행중, 150_000_000L, "2026-01-01", "2026-12-31"));
        projects.add(buildProject("J제조 MES 유지보수", sys, projectTypes.get(3),
                ProjectStatus.진행중, 120_000_000L, "2026-01-01", "2026-12-31"));
        projects.add(buildProject("K금융 인프라 운영대행", sys, projectTypes.get(4),
                ProjectStatus.진행중, 200_000_000L, "2026-01-01", "2026-12-31"));
        projects.add(buildProject("L공공기관 IT 운영대행", sys, projectTypes.get(4),
                ProjectStatus.진행중, 180_000_000L, "2026-01-01", "2026-12-31"));
        projects.add(buildProject("M유통 SCM 유지보수", sys, projectTypes.get(3),
                ProjectStatus.진행중, 100_000_000L, "2026-01-01", "2026-06-30"));
        projects.add(buildProject("N통신사 BSS 운영", sys, projectTypes.get(4),
                ProjectStatus.진행중, 250_000_000L, "2026-01-01", "2026-12-31"));
        projects.add(buildProject("O의료 EMR 유지보수", sys, projectTypes.get(3),
                ProjectStatus.완료, 80_000_000L, "2025-07-01", "2026-01-31"));

        // 컨설팅사업본부 (5개)
        Department con = departments.get(2);
        projects.add(buildProject("P그룹사 ISP 수립", con, projectTypes.get(5),
                ProjectStatus.진행중, 300_000_000L, "2026-01-13", "2026-04-30"));
        projects.add(buildProject("Q공기업 BPR 컨설팅", con, projectTypes.get(5),
                ProjectStatus.진행중, 250_000_000L, "2026-02-03", "2026-05-31"));
        projects.add(buildProject("R대기업 DX 전략 PMO", con, projectTypes.get(6),
                ProjectStatus.진행중, 400_000_000L, "2026-01-06", "2026-06-30"));
        projects.add(buildProject("S공공 정보화 PMO", con, projectTypes.get(6),
                ProjectStatus.진행중, 350_000_000L, "2026-01-20", "2026-07-31"));
        projects.add(buildProject("T제조 스마트팩토리 ISP", con, projectTypes.get(5),
                ProjectStatus.완료, 200_000_000L, "2025-10-01", "2026-02-28"));

        return projectRepository.saveAll(projects);
    }

    // ── 6. 표준공수 35건 (7유형 × 5직급) ─────────────────────────────
    private void initStandardCostRates(List<ProjectType> projectTypes, List<JobGrade> jobGrades) {
        List<StandardCostRate> rates = new ArrayList<>();
        Random random = new Random(42);
        for (ProjectType pt : projectTypes) {
            for (JobGrade jg : jobGrades) {
                BigDecimal hours = BigDecimal.valueOf(100 + random.nextInt(400));
                rates.add(StandardCostRate.builder()
                        .projectType(pt)
                        .jobGrade(jg)
                        .standardHours(hours)
                        .build());
            }
        }
        standardCostRateRepository.saveAll(rates);
    }

    // ── 7. 예산 20건 (프로젝트당 1건) ──────────────────────────────
    private void initBudgetPlans(List<Project> projects) {
        List<BudgetPlan> budgets = new ArrayList<>();
        Random random = new Random(42);
        for (Project p : projects) {
            double ratio = 0.7 + (random.nextDouble() * 0.2);
            long budgetAmt = (long) (p.getContractAmount() * ratio);
            budgets.add(BudgetPlan.builder()
                    .project(p)
                    .budgetAmount(budgetAmt)
                    .fiscalYear(2026)
                    .fiscalQuarter(1)
                    .build());
        }
        budgetPlanRepository.saveAll(budgets);
    }

    // ── 8. 간접비 ~12건 (지원 2본부 × 2비목 × 3개월) ──────────────────
    private void initOverheadExpenses(List<Department> departments) {
        List<OverheadExpense> overheads = new ArrayList<>();
        Random random = new Random(42);
        String[] categories = {"인건비", "운영비"};
        String[] months = {"2026-01-01", "2026-02-01", "2026-03-01"};

        for (Department dept : departments) {
            if (dept.getType() == DepartmentType.지원) {
                for (String month : months) {
                    for (String category : categories) {
                        long amount = 10_000_000L + random.nextInt(20_000_000);
                        overheads.add(OverheadExpense.builder()
                                .department(dept)
                                .costCategory(category)
                                .amount(amount)
                                .costMonth(LocalDate.parse(month))
                                .build());
                    }
                }
            }
        }
        overheadExpenseRepository.saveAll(overheads);
    }

    // ── 9. 프로젝트 직접비 ~50건 ───────────────────────────────────
    private void initDirectExpenses(List<Project> projects) {
        List<DirectExpense> expenses = new ArrayList<>();
        Random random = new Random(42);
        String[] types = {"외주비", "출장비", "인프라구매"};

        for (Project p : projects) {
            int count = 1 + random.nextInt(4);
            for (int i = 0; i < count; i++) {
                String type = types[random.nextInt(types.length)];
                long amount = 1_000_000L + random.nextInt(10_000_000);
                expenses.add(DirectExpense.builder()
                        .project(p)
                        .costType(type)
                        .vendorName("업체" + random.nextInt(100))
                        .description(type + " 지출")
                        .amount(amount)
                        .costDate(p.getStartDate().plusDays(random.nextInt(30)))
                        .build());
            }
        }
        directExpenseRepository.saveAll(expenses);
    }

    // ── 10. 공수 ~4,800건 (80명 × 약 60일) ────────────────────────
    private void initTimeEntries(List<Employee> employees, List<Project> projects) {
        List<TimeEntry> entries = new ArrayList<>();
        Random random = new Random(42);
        String[] activities = {"개발", "기획", "QA", "PM", "공통"};

        LocalDate start = LocalDate.of(2026, 1, 1);
        LocalDate end = LocalDate.of(2026, 3, 31);

        for (Employee emp : employees) {
            List<Project> deptProjects = projects.stream()
                    .filter(p -> p.getDepartment().getId().equals(emp.getDepartment().getId()))
                    .toList();

            if (deptProjects.isEmpty()) {
                // 지원본부 인원은 가상의 지원 프로젝트 또는 제외 (여기서는 빈 배열로 스킵)
                continue;
            }

            for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
                if (date.getDayOfWeek().getValue() >= 6) continue;

                Project p = deptProjects.get(random.nextInt(deptProjects.size()));
                String activity = activities[random.nextInt(activities.length)];

                entries.add(TimeEntry.builder()
                        .employee(emp)
                        .project(p)
                        .activityType(activity)
                        .workDate(date)
                        .hours(BigDecimal.valueOf(8.0))
                        .build());
            }
        }
        timeEntryRepository.saveAll(entries);
    }

    // ── Helper ──────────────────────────────────────────────────

    private Project buildProject(String name, Department dept, ProjectType type,
                                 ProjectStatus status, Long amount,
                                 String start, String end) {
        return Project.builder()
                .name(name)
                .department(dept)
                .projectType(type)
                .status(status)
                .contractAmount(amount)
                .startDate(LocalDate.parse(start))
                .endDate(LocalDate.parse(end))
                .build();
    }

    /**
     * 전체 인원(total)을 비율(ratios)에 맞게 정수로 분배한다.
     * 반올림 누적 오차를 마지막 그룹에서 보정.
     */
    private int[] distributeByRatio(int total, double[] ratios) {
        int[] result = new int[ratios.length];
        int sum = 0;
        for (int i = 0; i < ratios.length - 1; i++) {
            result[i] = (int) Math.round(total * ratios[i]);
            sum += result[i];
        }
        result[ratios.length - 1] = total - sum; // 나머지 보정
        return result;
    }

    private void initUsers() {
        log.info("▶ 기본 사용자 시딩 시작");
        String encoded = passwordEncoder.encode(initPassword);
        userRepository.saveAll(List.of(
                AppUser.builder()
                        .username("admin")
                        .password(encoded)
                        .displayName("시스템 관리자")
                        .role(RoleType.ROLE_ADMIN)
                        .build(),
                AppUser.builder()
                        .username("director")
                        .password(encoded)
                        .displayName("김본부장")
                        .role(RoleType.ROLE_DIRECTOR)
                        .build(),
                AppUser.builder()
                        .username("pm")
                        .password(encoded)
                        .displayName("박매니저")
                        .role(RoleType.ROLE_PM)
                        .build(),
                AppUser.builder()
                        .username("user")
                        .password(encoded)
                        .displayName("이사원")
                        .role(RoleType.ROLE_USER)
                        .build()
        ));
        log.info("✅ 기본 사용자 4명 시딩 완료 (비밀번호는 환경변수 ADMIN_INIT_PASSWORD 참조)");
    }
}
