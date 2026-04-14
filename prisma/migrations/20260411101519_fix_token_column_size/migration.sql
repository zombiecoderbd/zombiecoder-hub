-- AlterTable
ALTER TABLE `agent_configs` MODIFY `configJson` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `agent_memory` MODIFY `embedding` TEXT NULL;

-- AlterTable
ALTER TABLE `agents` MODIFY `personaJson` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `governance_policies` MODIFY `ruleJson` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `sessions` MODIFY `token` TEXT NULL,
    MODIFY `contextJson` TEXT NULL,
    MODIFY `metadata` TEXT NULL;

-- AlterTable
ALTER TABLE `tools` MODIFY `schema` TEXT NOT NULL;
