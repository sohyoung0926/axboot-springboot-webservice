package edu.axboot.domain.company;

import com.chequer.axboot.core.domain.base.AXBootJPAQueryDSLRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends AXBootJPAQueryDSLRepository<Company, Long> {
}