package br.puc.aluguelcarros.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import io.micronaut.core.annotation.Introspected;

@Introspected
@Entity
@Table(name = "bancos")
public class Banco extends Agente {

    public Banco() {
        super();
    }
    
}