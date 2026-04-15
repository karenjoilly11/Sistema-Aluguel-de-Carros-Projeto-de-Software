package br.puc.aluguelcarros.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Entidade que representa uma instituição bancária parceira.
 *
 * <p>Herda todos os atributos de {@link Agente} (CPF, endereço, profissão)
 * e de {@link Usuario} (email, senha, nome, role).
 * Um Banco pode ser vinculado a um {@link Contrato} para representar
 * o financiamento ou crédito bancário utilizado no aluguel.</p>
 *
 * <p>Role correspondente no sistema: {@code BANCO}.</p>
 */
@Serdeable
@Entity
@Table(name = "bancos")
public class Banco extends Agente {

    public Banco() {
        super();
    }
    
}