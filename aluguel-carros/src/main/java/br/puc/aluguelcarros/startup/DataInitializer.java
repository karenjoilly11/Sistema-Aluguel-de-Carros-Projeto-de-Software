package br.puc.aluguelcarros.startup;

import br.puc.aluguelcarros.service.AuthService;
import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.runtime.server.event.ServerStartupEvent;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
public class DataInitializer implements ApplicationEventListener<ServerStartupEvent> {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AuthService authService;

    public DataInitializer(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void onApplicationEvent(ServerStartupEvent event) {
        if (!authService.existeAlgumUsuario()) {
            authService.registrar("Administrador", "admin@driveelite.com", "admin123", "ADMIN");
            log.info("==============================================");
            log.info("  Usuário admin criado automaticamente:");
            log.info("  email: admin@driveelite.com");
            log.info("  senha: admin123");
            log.info("==============================================");
        }
    }
}
