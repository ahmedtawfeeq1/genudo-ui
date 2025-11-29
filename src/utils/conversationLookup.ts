/**
 * Static conversation lookup utilities
 * Replace with backend queries on integration.
 */

/**
 * Finds conversation ID by opportunity ID
 * @param opportunityId - The opportunity ID to search for
 * @param userId - The user ID for security filtering
 * @returns Promise<string | null> - The conversation ID or null if not found
 */
export async function findConversationByOpportunityId(
  opportunityId: string, 
  userId: string
): Promise<string | null> {
  await new Promise(res => setTimeout(res, 100));
  return null;
}

/**
 * Gets pipeline ID from opportunity ID for inbox filtering
 * @param opportunityId - The opportunity ID
 * @param userId - The user ID for security filtering
 * @returns Promise<string | null> - The pipeline ID or null if not found
 */
export async function getPipelineIdFromOpportunity(
  opportunityId: string,
  userId: string
): Promise<string | null> {
  await new Promise(res => setTimeout(res, 100));
  return 'pipe-1';
}
