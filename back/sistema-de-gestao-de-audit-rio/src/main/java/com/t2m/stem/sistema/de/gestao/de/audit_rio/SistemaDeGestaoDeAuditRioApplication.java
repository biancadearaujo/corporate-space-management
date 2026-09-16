package com.t2m.stem.sistema.de.gestao.de.audit_rio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class SistemaDeGestaoDeAuditRioApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaDeGestaoDeAuditRioApplication.class, args);
	}

}
