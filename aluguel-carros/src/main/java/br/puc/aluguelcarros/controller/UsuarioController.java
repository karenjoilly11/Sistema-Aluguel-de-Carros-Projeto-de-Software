package br.puc.aluguelcarros.controller;

import br.puc.aluguelcarros.model.Usuario;
import br.puc.aluguelcarros.repository.UsuarioRepository;
import br.puc.aluguelcarros.service.AuthService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.authentication.Authentication;
import io.micronaut.security.rules.SecurityRule;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Map;

@Controller("/usuarios")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class UsuarioController {

    private final UsuarioRepository repository;
    private final AuthService authService;

    public UsuarioController(UsuarioRepository repository, AuthService authService) {
        this.repository  = repository;
        this.authService = authService;
    }

    /** Retorna os dados do usuário autenticado (qualquer role). */
    @Get("/me")
    public HttpResponse<?> me(Authentication auth) {
        return repository.findByEmail(auth.getName())
                .map(u -> HttpResponse.ok(Map.of(
                        "id",    u.getId(),
                        "nome",  u.getNome(),
                        "email", u.getEmail(),
                        "role",  u.getRole()
                )))
                .orElse(HttpResponse.notFound());
    }

    /** Lista todos os usuários — somente ADMIN. */
    @Get
    public HttpResponse<?> listar(Authentication auth) {
        if (!isAdmin(auth)) return HttpResponse.status(HttpStatus.FORBIDDEN);
        return HttpResponse.ok(
                repository.findAll().stream().map(u -> Map.of(
                        "id",    u.getId(),
                        "nome",  u.getNome(),
                        "email", u.getEmail(),
                        "role",  u.getRole()
                )).toList()
        );
    }

    /** Cria um novo usuário — somente ADMIN. */
    @Post
    public HttpResponse<?> criar(@Body Map<String, String> body, Authentication auth) {
        if (!isAdmin(auth)) return HttpResponse.status(HttpStatus.FORBIDDEN);
        String nome  = body.getOrDefault("nome", "Usuário");
        String email = body.get("email");
        String senha = body.get("senha");
        String role  = body.getOrDefault("role", "CLIENTE");
        if (email == null || senha == null) {
            return HttpResponse.badRequest(Map.of("message", "email e senha são obrigatórios."));
        }
        try {
            Usuario criado = authService.registrar(nome, email, senha, role);
            return HttpResponse.created(Map.of(
                    "id",    criado.getId(),
                    "nome",  criado.getNome(),
                    "email", criado.getEmail(),
                    "role",  criado.getRole()
            ));
        } catch (RuntimeException e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }

    /** Atualiza nome, email e/ou role de um usuário — somente ADMIN. */
    @Put("/{id}")
    public HttpResponse<?> atualizar(Long id, @Body Map<String, String> body, Authentication auth) {
        if (!isAdmin(auth)) return HttpResponse.status(HttpStatus.FORBIDDEN);
        return repository.findById(id).map(u -> {
            if (body.containsKey("nome"))  u.setNome(body.get("nome"));
            if (body.containsKey("email")) u.setEmail(body.get("email"));
            if (body.containsKey("role"))  u.setRole(body.get("role"));
            if (body.containsKey("senha") && !body.get("senha").isBlank()) {
                u.setSenhaHash(BCrypt.hashpw(body.get("senha"), BCrypt.gensalt()));
            }
            Usuario salvo = repository.update(u);
            return HttpResponse.ok(Map.of(
                    "id",    salvo.getId(),
                    "nome",  salvo.getNome(),
                    "email", salvo.getEmail(),
                    "role",  salvo.getRole()
            ));
        }).orElse(HttpResponse.notFound());
    }

    /** Remove um usuário — somente ADMIN. Não pode remover a si mesmo. */
    @Delete("/{id}")
    public HttpResponse<?> excluir(Long id, Authentication auth) {
        if (!isAdmin(auth)) return HttpResponse.status(HttpStatus.FORBIDDEN);
        return repository.findById(id).map(u -> {
            if (u.getEmail().equals(auth.getName())) {
                return HttpResponse.<Void>badRequest();
            }
            repository.deleteById(id);
            return HttpResponse.<Void>noContent();
        }).orElse(HttpResponse.notFound());
    }

    private boolean isAdmin(Authentication auth) {
        Object role = auth.getAttributes().get("role");
        return "ADMIN".equals(role);
    }
}
