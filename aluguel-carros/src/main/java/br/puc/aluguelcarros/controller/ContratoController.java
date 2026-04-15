package br.puc.aluguelcarros.controller;

import br.puc.aluguelcarros.model.Contrato;
import br.puc.aluguelcarros.repository.ContratoRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;

@Controller("/contratos")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class ContratoController {

    private final ContratoRepository repository;

    public ContratoController(ContratoRepository repository) {
        this.repository = repository;
    }

    @Get("/{id}")
    public HttpResponse<Contrato> buscar(Long id) {
        return repository.findById(id)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Post("/{id}/assinar")
    public HttpResponse<Contrato> assinar(Long id) {
        return repository.findById(id).map(contrato -> {
            contrato.registrarAssinatura();
            return HttpResponse.ok(repository.update(contrato));
        }).orElse(HttpResponse.notFound());
    }
}
