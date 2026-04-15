package br.puc.aluguelcarros.controller;

import br.puc.aluguelcarros.model.Automovel;
import br.puc.aluguelcarros.repository.AutomovelRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;

import java.util.List;

@Controller("/automoveis")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class AutomovelController {

    private final AutomovelRepository repository;

    public AutomovelController(AutomovelRepository repository) {
        this.repository = repository;
    }

    /** Listagem pública — landing page não exige login. */
    @Get
    @Secured(SecurityRule.IS_ANONYMOUS)
    public List<Automovel> listar() {
        return repository.findAll();
    }

    @Post
    public HttpResponse<Automovel> cadastrar(@Body Automovel automovel) {
        return HttpResponse.created(repository.save(automovel));
    }

    @Get("/{id}")
    public HttpResponse<Automovel> buscar(Long id) {
        return repository.findById(id)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Put("/{id}")
    public HttpResponse<Automovel> atualizar(Long id, @Body Automovel dados) {
        return repository.findById(id).map(auto -> {
            auto.setPlaca(dados.getPlaca());
            auto.setMarca(dados.getMarca());
            auto.setModelo(dados.getModelo());
            auto.setCor(dados.getCor());
            auto.setAno(dados.getAno());
            auto.setValorDiaria(dados.getValorDiaria());
            auto.setDisponivel(dados.isDisponivel());
            return HttpResponse.ok(repository.update(auto));
        }).orElse(HttpResponse.notFound());
    }

    @Delete("/{id}")
    public HttpResponse<Void> excluir(Long id) {
        if (repository.findById(id).isEmpty()) return HttpResponse.notFound();
        repository.deleteById(id);
        return HttpResponse.noContent();
    }
}
