package br.puc.aluguelcarros;

import io.micronaut.runtime.Micronaut;

/**
 * Ponto de entrada da aplicação Micronaut.
 *
 * DIFERENÇA vs Spring Boot:
 *   Spring Boot → SpringApplication.run(App.class, args)
 *   Micronaut   → Micronaut.run(App.class, args)
 *
 * Não há @SpringBootApplication nem @EnableAutoConfiguration.
 * O Micronaut processa toda injeção de dependência em tempo de
 * compilação (via annotation processors), eliminando o uso de reflexão.
 */
public class Application {

    public static void main(String[] args) {
        Micronaut.run(Application.class, args);
    }
}
