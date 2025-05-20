"use server";

import {
  getComplianceStats,
  updateComplianceStats,
  getControls,
} from "../lib/db";
import type { ComplianceStats } from "../types/database";

function serializeComplianceStats(
  stats: ComplianceStats & { _id?: { toString(): string } }
) {
  return {
    ...stats,
    _id: stats._id?.toString(),
    lastUpdated: stats.lastUpdated.toISOString(),
    categoryStats: stats.categoryStats.map((cat) => ({ ...cat })),
  };
}

export async function fetchComplianceStats() {
  try {
    const stats = await getComplianceStats();
    if(stats)
    {
      const serializedStats = serializeComplianceStats(stats);
      return { success: true, data: serializedStats };
    } else {
      return { success: false, error: "Failed to fetch compliance stats" };
    }

  } catch (error) {
    console.error("Error fetching compliance stats:", error);
    return { success: false, error: "Failed to fetch compliance stats" };
  }
}

export async function recalculateComplianceStats() {
  try {
    const controls = await getControls();
    if (!controls || controls.length === 0) {
      const stats: ComplianceStats = {
        totalControls: 0,
        compliantControls: 0,
        nonCompliantControls: 0,
        criticalFindings: 0,
        lastUpdated: new Date(),
        categoryStats: [],
      };
      await updateComplianceStats(stats);
      return { success: true, data: stats };
    }

    const categoriesMap = new Map<
      string,
      { total: number; compliant: number; critical: number }
    >();
    controls.forEach((control) => {
      const cat = control.category || "Uncategorized";
      if (!categoriesMap.has(cat)) {
        categoriesMap.set(cat, { total: 0, compliant: 0, critical: 0 });
      }
      const statsForCat = categoriesMap.get(cat)!;
      statsForCat.total++;
      if (control.compliant) {
        statsForCat.compliant++;
      }
      if (!control.compliant && control.canAutomate) {
        statsForCat.critical++;
      }
    });

    const categoryStats = Array.from(categoriesMap.entries()).map(
      ([category, { total, compliant, critical }]) => ({
        category,
        total,
        compliant,
        percentage: total ? Math.round((compliant / total) * 100) : 0,
        criticalFindings: critical,
      })
    );

    const totalControls = controls.length;
    const compliantControls = controls.filter((c) => c.compliant).length;
    const criticalFindings = categoryStats.reduce(
      (sum, stat) => sum + stat.criticalFindings,
      0
    );

    const stats: ComplianceStats = {
      totalControls,
      compliantControls,
      nonCompliantControls: totalControls - compliantControls,
      criticalFindings,
      lastUpdated: new Date(),
      categoryStats,
    };

    await updateComplianceStats(stats);

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error recalculating compliance stats:", error);
    return { success: false, error: "Failed to recalculate compliance stats" };
  }
}