import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAllFilters } from '../worker/dto/request/getAllFilters.dto';
import { Customer } from './customer.entity';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/request/createCustomer.dto';
import { GetAllCustomerResponseDto } from './dto/response/getAllCustomerResponse.dto';

@Controller('customer')
@ApiTags('Customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cliente criado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cliente já existe',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Aconteceu algum erro',
  })
  @ApiOperation({ description: 'Endpoint de criação do cliente' })
  async create(@Body() req: CreateCustomerDto) {
    return await this.customerService.create(req);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Clientees retornados com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Aconteceu algum erro',
  })
  @ApiOperation({ description: 'Endpoint de retorno de clientes' })
  async getAll(
    @Query() filters: GetAllFilters,
  ): Promise<GetAllCustomerResponseDto> {
    return await this.customerService.getAll(filters);
  }

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cliente retornado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não existe',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Aconteceu algum erro',
  })
  @ApiOperation({ description: 'Endpoint de retorno de um cliente por ID' })
  async getOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Customer> {
    return await this.customerService.getOne(id);
  }

  /*
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() req: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.update(id, req);
  }
  */

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cliente removido com sucesso, porém sem retorno',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não existe',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Aconteceu algum erro',
  })
  @ApiOperation({ description: 'Endpoint de exclusão de um cliente' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.customerService.delete(id);
  }
}
