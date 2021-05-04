package edu.axboot.domain.company;

import org.springframework.stereotype.Service;
import edu.axboot.domain.BaseService;
import javax.inject.Inject;
import com.chequer.axboot.core.parameter.RequestParams;
import java.util.List;

@Service
public class CompanyService extends BaseService<Company, Long> {
    private CompanyRepository companyRepository;

    @Inject
    public CompanyService(CompanyRepository companyRepository) {
        super(companyRepository);
        this.companyRepository = companyRepository;
    }

    public List<Company> gets(RequestParams<Company> requestParams) {
        return findAll();
    }
}