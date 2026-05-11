import coordinatorsData from "@/data/coordinators.json";
import { normalizeText } from "@/lib/normalize-text";

export type CoordinatorRecord = {
  name: string;
  title: string;
  email: string;
  lastUpdate: string;
  photoUrl: string | null;
};

export type DepartmentCoordinator = {
  departmentId: string;
  departmentName: string;
  coordinator: CoordinatorRecord;
};

export const departmentCoordinators: DepartmentCoordinator[] = coordinatorsData;

const byId = new Map(
  departmentCoordinators.map((entry) => [entry.departmentId, entry]),
);

export function getDepartmentById(
  departmentId: string,
): DepartmentCoordinator | undefined {
  return byId.get(departmentId);
}

export function filterDepartmentCoordinators(
  query: string,
  limit = 12,
): DepartmentCoordinator[] {
  const normalized = normalizeText(query);
  if (normalized.length < 2) return [];

  return departmentCoordinators
    .filter((entry) => {
      const blob = [
        entry.departmentId,
        entry.departmentName,
        entry.coordinator.name,
        entry.coordinator.email,
      ]
        .map(normalizeText)
        .join(" ");
      return blob.includes(normalized);
    })
    .slice(0, limit);
}
