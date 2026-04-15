package br.puc.aluguelcarros.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Entity
@Table(name = "empresas")
public class Empresa extends Agente {

    public Empresa() {
        super();
    }
    
}