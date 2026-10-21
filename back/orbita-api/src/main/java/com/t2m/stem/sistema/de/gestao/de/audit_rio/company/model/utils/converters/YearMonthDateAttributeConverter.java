package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.utils.converters;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.YearMonth;
import java.time.LocalDate;

@Converter(autoApply = true)
public class YearMonthDateAttributeConverter implements AttributeConverter<YearMonth, LocalDate> {
    @Override
    public LocalDate convertToDatabaseColumn(YearMonth yearMonth) {
        return yearMonth != null ? yearMonth.atDay(1) : null;
    }

    @Override
    public YearMonth convertToEntityAttribute(LocalDate localDate) {
        return localDate != null ? YearMonth.from(localDate) : null;
    }
}