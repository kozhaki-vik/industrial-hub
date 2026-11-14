# Code Signing Policy

Free code signing provided by [SignPath.io](https://signpath.io/), certificate by [SignPath Foundation](https://signpath.org/).

## 1. Project Overview & Governance
Industrial Hub is an open-source Windows desktop utility and community management tool developed and maintained by Dmytro Kondratenko. All source code is publicly accessible and auditable in the official repository:  
[https://github.com/kozhaki-vik/industrial-hub](https://github.com/kozhaki-vik/industrial-hub)

## 2. Roles and Responsibilities
In accordance with SignPath Foundation code signing standards:
- **Author:** Dmytro Kondratenko (@kozhaki-vik)
- **Committer:** Dmytro Kondratenko (@kozhaki-vik)
- **Release Approver:** Dmytro Kondratenko (@kozhaki-vik)

All commits and release tags originate strictly from verified repository maintainers. Any contributions or pull requests undergo rigorous code review and automated continuous integration checks prior to merging.

## 3. Build & Release Pipeline
- **Automated CI/CD:** Release artifacts and installers are built exclusively via reproducible automated workflows on GitHub Actions running in clean, ephemeral Windows runners.
- **Reproducible Builds:** The build configuration, dependencies, and compilation scripts are version-controlled in this repository. Builds are generated directly from tagged commits on the `main` branch.
- **Signing Process:** Binaries are submitted to SignPath.io for signing only through automated CI triggers with signed release approvals. Signing keys and certificates are securely managed by the SignPath Foundation and are never stored or exposed locally.

## 4. Privacy and Security Commitments
The project strictly respects user privacy and system security:
- No telemetry containing personal data or device hardware serial numbers is collected.
- For complete details on data handling and privacy protections, see [PRIVACY.md](PRIVACY.md).
