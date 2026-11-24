package org.elyora.rooms

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class RoomTemplate(val id: String, val workspace: String, val experience: String, val availability: String) {
    val offersSample: Boolean get() = availability == "sample"
}

@Serializable
private data class Catalog(val version: Int, val rooms: List<RoomTemplate>)

/** Public discovery metadata. Joining a live room always requires a separate server decision. */
class RoomDirectory private constructor(private val entries: List<RoomTemplate>) {
    fun inWorkspace(workspace: String): List<RoomTemplate> = entries.filter { it.workspace == workspace }

    companion object {
        fun decode(source: String): RoomDirectory {
            val catalog = Json { ignoreUnknownKeys = true }.decodeFromString<Catalog>(source)
            require(catalog.version == 1) { "Unsupported room catalog version" }
            require(catalog.rooms.map { it.id }.distinct().size == catalog.rooms.size) { "Duplicate room identifier" }
            require(catalog.rooms.all { it.id.isNotBlank() && it.workspace.isNotBlank() && it.experience.isNotBlank() })
            return RoomDirectory(catalog.rooms)
        }
    }
}
