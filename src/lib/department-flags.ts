import flagByDepartmentId from "@/data/department-flags.json";

const flagMap = flagByDepartmentId as Record<string, string | null>;

export function getDepartmentFlagUrl(departmentId: string): string | null {
  return flagMap[departmentId] ?? null;
}
