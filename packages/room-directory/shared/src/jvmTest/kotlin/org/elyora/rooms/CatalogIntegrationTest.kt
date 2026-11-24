package org.elyora.rooms

import kotlin.test.Test
import kotlin.test.assertTrue
import kotlin.test.assertFalse

class CatalogIntegrationTest {
    @Test fun loadsActualCampusCatalog() {
        val source = checkNotNull(javaClass.getResource("/catalog.v1.json")).readText()
        val directory = RoomDirectory.decode(source)
        assertTrue(directory.inWorkspace("student").single { it.id == "story-studio" }.offersSample)
        assertFalse(directory.inWorkspace("classroom").single { it.id == "discussion-circle" }.offersSample)
    }
}
