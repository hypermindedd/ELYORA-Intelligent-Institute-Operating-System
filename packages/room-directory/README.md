# Room directory

The catalog lists public experiences within the four existing Institute workspaces. Each stable room ID identifies a template. A school, class, teacher or learner is never identified by this catalog. A sample is offline content, and a planned room is visible without a join action.

The Kotlin Multiplatform shared module reads version 1 for JVM and Apple clients. Use Gradle 8.14.3 and JDK 17: from this directory run `gradle :shared:jvmTest`. On Apple Silicon with Xcode run `gradle :shared:iosSimulatorArm64Test`. The JVM test consumes the actual catalog. These targets exercise shared code, not complete Android or iOS applications.

Future products may consume public discovery and presentation state. Audio capture, device permissions and accessible controls belong in platform adapters. Admission and reauthorization stay server-side within the Institute tenant, membership and time window. Story delivery from the parent uses its verified E06 contract; shared code has no authority to issue competency, attendance or live media credentials.
