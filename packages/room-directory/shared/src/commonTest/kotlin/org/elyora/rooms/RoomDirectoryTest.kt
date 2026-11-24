package org.elyora.rooms

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import kotlin.test.assertFailsWith

class RoomDirectoryTest {
    private val room = """{"id":"sample-1","workspace":"student","experience":"story","availability":"future-state"}"""

    @Test fun unknownAvailabilityDoesNotOfferSample() {
        val catalog = RoomDirectory.decode("""{"version":1,"rooms":[$room]}""")
        assertFalse(catalog.inWorkspace("student").single().offersSample)
        assertTrue(catalog.inWorkspace("teacher").isEmpty())
    }

    @Test fun rejectsDuplicateRoomsAndUnknownVersions() {
        assertFailsWith<IllegalArgumentException> { RoomDirectory.decode("""{"version":1,"rooms":[$room,$room]}""") }
        assertFailsWith<IllegalArgumentException> { RoomDirectory.decode("""{"version":2,"rooms":[]}""") }
    }
}
