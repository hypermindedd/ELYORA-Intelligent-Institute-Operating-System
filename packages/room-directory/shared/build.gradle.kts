plugins {
    kotlin("multiplatform") version "2.2.21"
    kotlin("plugin.serialization") version "2.2.21"
}

kotlin {
    jvm()
    js(IR) { nodejs() }
    iosArm64()
    iosSimulatorArm64()
    jvmToolchain(17)
    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0")
        }
        commonTest.dependencies { implementation(kotlin("test")) }
        jvmTest { resources.srcDir(layout.buildDirectory.dir("catalog-test")) }
    }
}

val copyCatalog by tasks.registering(Copy::class) {
    from(rootProject.file("catalog.v1.json"))
    into(layout.buildDirectory.dir("catalog-test"))
}
tasks.named("jvmTestProcessResources") { dependsOn(copyCatalog) }
