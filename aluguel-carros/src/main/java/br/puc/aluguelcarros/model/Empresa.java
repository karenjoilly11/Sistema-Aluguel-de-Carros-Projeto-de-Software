package br.puc.aluguelcarros.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Entidade que representa uma empresa parceira ou locadora.
 *
 * <p>Herda todos os atributos de {@link Agente} e {@link Usuario}.
 * Representa organizações que interagem com o sistema de aluguel,
 * podendo ser fornecedoras de veículos ou parceiras comerciais.</p>
 *
 * <p>Role correspondente no sistema: {@code EMPRESA}.</p>
 */
@Serdeable
@Entity
@Table(name = "empresas")
public class Empresa extends Agente {

    public Empresa() {
        super();
    }
    
}