package br.puc.aluguelcarros.controller;

import br.puc.aluguelcarros.model.Contrato;
import br.puc.aluguelcarros.repository.ContratoRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;

/**
 * Controller REST para gerenciamento de contratos de aluguel.
 *
 * <p>Os contratos são gerados a partir de pedidos aprovados via
 * {@code POST /pedidos/{id}/contrato}. Este controller oferece
 * operações de consulta e assinatura.</p>
 *
 * <p>Endpoints:
 * <ul>
 *   <li>{@code GET  /contratos/{id}}         — busca contrato por ID</li>
 *   <li>{@code POST /contratos/{id}/assinar} — registra assinatura digital do contrato</li>
 * </ul>
 * </p>
 */
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
