package com.t2m.stem.sistema.de.gestao.de.audit_rio.errors;

import lombok.Data;

@Data
public class NotFoundException extends RuntimeException{
    public NotFoundException(String message){
        super(message);
    }
}
