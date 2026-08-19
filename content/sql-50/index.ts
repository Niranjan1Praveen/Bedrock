import type { Problem } from "../types";
import { problem as recyclableAndLowFatProducts } from "./recyclable-and-low-fat-products";
import { problem as findCustomerReferee } from "./find-customer-referee";
import { problem as replaceEmployeeId } from "./replace-employee-id-with-the-unique-identifier";
import { problem as risingTemperature } from "./rising-temperature";
import { problem as averageTimeOfProcessPerMachine } from "./average-time-of-process-per-machine";

/** Ordered by increasing conceptual weight rather than by problem number. */
export const problems: Problem[] = [
  recyclableAndLowFatProducts,
  findCustomerReferee,
  replaceEmployeeId,
  risingTemperature,
  averageTimeOfProcessPerMachine,
];
