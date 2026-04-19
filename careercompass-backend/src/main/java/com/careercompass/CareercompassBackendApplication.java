package com.careercompass;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.careercompass.model.Role;
import com.careercompass.model.User;
import com.careercompass.repository.UserRepository;

@SpringBootApplication
public class CareercompassBackendApplication {

	private static final Logger log = LoggerFactory.getLogger(CareercompassBackendApplication.class);

	static {
		// 🛡️ Global Security Override for Java 25 + MongoDB Atlas Compatibility
		// Java 25 enables features (ML-KEM, TLS 1.3 extensions) that Atlas currently
		// rejects.
		// These settings force the Entire JVM to use a clean TLS 1.2 handshake.

		java.security.Security.setProperty("jdk.tls.disabledAlgorithms",
				"TLSv1.3, SSLv3, RC4, DES, MD5withRSA, DH keySize < 1024, EC keySize < 224, 3DES_EDE_CBC, anon, NULL");

		System.setProperty("jdk.tls.client.protocols", "TLSv1.2");
		System.setProperty("jdk.tls.namedGroups", "secp256r1,secp384r1,secp521r1,x25519,x448,ffdhe2048,ffdhe3072");
		System.setProperty("jdk.tls.useExtendedMasterSecret", "true"); // standard for TLS 1.2
		System.setProperty("jdk.tls.server.enableStatusRequestExtension", "false");
		System.setProperty("sun.security.ssl.allowLegacyHelloMessages", "true");
	}

	public static void main(String[] args) {
		SpringApplication.run(CareercompassBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			try {
				if (userRepository.findByEmail("admin@school.com").isEmpty()) {
					User admin = User.builder()
							.name("System Admin")
							.email("admin@school.com")
							.password(passwordEncoder.encode("admin123"))
							.role(Role.ADMIN)
							.createdAt(java.time.LocalDateTime.now())
							.build();
					userRepository.save(admin);
					log.info("Default admin seeded.");
				}
				if (userRepository.findByEmail("teacher@school.com").isEmpty()) {
					User teacher = User.builder()
							.name("Default Teacher")
							.email("teacher@school.com")
							.password(passwordEncoder.encode("teacher123"))
							.role(Role.TEACHER)
							.createdAt(java.time.LocalDateTime.now())
							.build();
					userRepository.save(teacher);
					log.info("Default teacher seeded.");
				}
			} catch (Exception ex) {
				log.warn("Skipping default user seeding because MongoDB is unavailable: {}", ex.getMessage());
			}
		};
	}

}
