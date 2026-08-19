import type { Problem } from "../types";
import { problem as recyclableAndLowFatProducts } from "./recyclable-and-low-fat-products";
import { problem as findCustomerReferee } from "./find-customer-referee";
import { problem as bigCountries } from "./big-countries";
import { problem as articleViewsI } from "./article-views-i";
import { problem as invalidTweets } from "./invalid-tweets";
import { problem as replaceEmployeeIdWithTheUniqueIdentifier } from "./replace-employee-id-with-the-unique-identifier";
import { problem as productSalesAnalysisI } from "./product-sales-analysis-i";
import { problem as customerWhoVisitedButDidNotMakeAnyTransactions } from "./customer-who-visited-but-did-not-make-any-transactions";
import { problem as risingTemperature } from "./rising-temperature";
import { problem as averageTimeOfProcessPerMachine } from "./average-time-of-process-per-machine";
import { problem as employeeBonus } from "./employee-bonus";
import { problem as studentsAndExaminations } from "./students-and-examinations";
import { problem as managersWithAtLeast5DirectReports } from "./managers-with-at-least-5-direct-reports";
import { problem as confirmationRate } from "./confirmation-rate";
import { problem as notBoringMovies } from "./not-boring-movies";
import { problem as averageSellingPrice } from "./average-selling-price";
import { problem as projectEmployeesI } from "./project-employees-i";
import { problem as percentageOfUsersAttendedAContest } from "./percentage-of-users-attended-a-contest";
import { problem as queriesQualityAndPercentage } from "./queries-quality-and-percentage";
import { problem as monthlyTransactionsI } from "./monthly-transactions-i";
import { problem as immediateFoodDeliveryIi } from "./immediate-food-delivery-ii";
import { problem as gamePlayAnalysisIv } from "./game-play-analysis-iv";
import { problem as numberOfUniqueSubjectsTaughtByEachTeacher } from "./number-of-unique-subjects-taught-by-each-teacher";
import { problem as userActivityForThePast30DaysI } from "./user-activity-for-the-past-30-days-i";
import { problem as productSalesAnalysisIii } from "./product-sales-analysis-iii";
import { problem as classesMoreThan5Students } from "./classes-more-than-5-students";
import { problem as findFollowersCount } from "./find-followers-count";
import { problem as biggestSingleNumber } from "./biggest-single-number";
import { problem as customersWhoBoughtAllProducts } from "./customers-who-bought-all-products";
import { problem as theNumberOfEmployeesWhichReportToEachEmployee } from "./the-number-of-employees-which-report-to-each-employee";
import { problem as primaryDepartmentForEachEmployee } from "./primary-department-for-each-employee";
import { problem as triangleJudgement } from "./triangle-judgement";
import { problem as consecutiveNumbers } from "./consecutive-numbers";
import { problem as productPriceAtAGivenDate } from "./product-price-at-a-given-date";
import { problem as lastPersonToFitInTheBus } from "./last-person-to-fit-in-the-bus";
import { problem as countSalaryCategories } from "./count-salary-categories";
import { problem as employeesWhoseManagerLeftTheCompany } from "./employees-whose-manager-left-the-company";
import { problem as exchangeSeats } from "./exchange-seats";
import { problem as movieRating } from "./movie-rating";
import { problem as restaurantGrowth } from "./restaurant-growth";
import { problem as friendRequestsIiWhoHasTheMostFriends } from "./friend-requests-ii-who-has-the-most-friends";
import { problem as investmentsIn2016 } from "./investments-in-2016";
import { problem as departmentTopThreeSalaries } from "./department-top-three-salaries";
import { problem as fixNamesInATable } from "./fix-names-in-a-table";
import { problem as patientsWithACondition } from "./patients-with-a-condition";
import { problem as deleteDuplicateEmails } from "./delete-duplicate-emails";
import { problem as secondHighestSalary } from "./second-highest-salary";
import { problem as groupSoldProductsByTheDate } from "./group-sold-products-by-the-date";
import { problem as listTheProductsOrderedInAPeriod } from "./list-the-products-ordered-in-a-period";
import { problem as findUsersWithValidEMails } from "./find-users-with-valid-e-mails";

/**
 * The track, in LeetCode's own study-plan order.
 *
 * The section a problem belongs to is attached here rather than repeated in
 * all fifty files, so reordering the plan is a change in one place.
 */
const SECTIONS: { name: string; problems: Problem[] }[] = [
  {
    name: "Select",
    problems: [
      recyclableAndLowFatProducts,
      findCustomerReferee,
      bigCountries,
      articleViewsI,
      invalidTweets,
    ],
  },
  {
    name: "Basic Joins",
    problems: [
      replaceEmployeeIdWithTheUniqueIdentifier,
      productSalesAnalysisI,
      customerWhoVisitedButDidNotMakeAnyTransactions,
      risingTemperature,
      averageTimeOfProcessPerMachine,
      employeeBonus,
      studentsAndExaminations,
      managersWithAtLeast5DirectReports,
      confirmationRate,
    ],
  },
  {
    name: "Basic Aggregate Functions",
    problems: [
      notBoringMovies,
      averageSellingPrice,
      projectEmployeesI,
      percentageOfUsersAttendedAContest,
      queriesQualityAndPercentage,
      monthlyTransactionsI,
      immediateFoodDeliveryIi,
      gamePlayAnalysisIv,
    ],
  },
  {
    name: "Sorting and Grouping",
    problems: [
      numberOfUniqueSubjectsTaughtByEachTeacher,
      userActivityForThePast30DaysI,
      productSalesAnalysisIii,
      classesMoreThan5Students,
      findFollowersCount,
      biggestSingleNumber,
      customersWhoBoughtAllProducts,
    ],
  },
  {
    name: "Advanced Select and Joins",
    problems: [
      theNumberOfEmployeesWhichReportToEachEmployee,
      primaryDepartmentForEachEmployee,
      triangleJudgement,
      consecutiveNumbers,
      productPriceAtAGivenDate,
      lastPersonToFitInTheBus,
      countSalaryCategories,
    ],
  },
  {
    name: "Subqueries",
    problems: [
      employeesWhoseManagerLeftTheCompany,
      exchangeSeats,
      movieRating,
      restaurantGrowth,
      friendRequestsIiWhoHasTheMostFriends,
      investmentsIn2016,
      departmentTopThreeSalaries,
    ],
  },
  {
    name: "Advanced String Functions, Regex and Clauses",
    problems: [
      fixNamesInATable,
      patientsWithACondition,
      deleteDuplicateEmails,
      secondHighestSalary,
      groupSoldProductsByTheDate,
      listTheProductsOrderedInAPeriod,
      findUsersWithValidEMails,
    ],
  },
];

export const sections = SECTIONS.map((s) => s.name);

export const problems: Problem[] = SECTIONS.flatMap((s) =>
  s.problems.map((p) => ({ ...p, section: s.name })),
);
