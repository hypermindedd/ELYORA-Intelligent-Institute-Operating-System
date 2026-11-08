export async function inPostgresTenant(pool, tenantId, begin, work) {
  const client = await pool.connect();
  let rollbackError;
  try {
    await client.query(begin);
    await client.query("SELECT set_config('ei_os.tenant_id', $1, true)", [tenantId]);
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (failure) {
      rollbackError = failure;
    }
    throw error;
  } finally {
    client.release(rollbackError);
  }
}
