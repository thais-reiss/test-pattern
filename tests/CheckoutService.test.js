import { CheckoutService } from '../src/services/CheckoutService.js';
import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';
import { UserMother } from './builders/UserMother.js';
import { Item } from '../src/domain/Item.js';

describe('quando o pagamento falha', () => {
  it('deve retornar null', async () => {
    
    // Arrange
    const carrinho = new CarrinhoBuilder().build();
    const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: false }) };
    const pedidoRepositoryDummy = { salvar: jest.fn() };
    const emailServiceDummy = { enviarEmail: jest.fn() };

    const checkoutService = new CheckoutService(
      gatewayStub,
      pedidoRepositoryDummy,
      emailServiceDummy
    );

    // Act
    const pedido = await checkoutService.processarPedido(carrinho, 'cartao-1234');

    // Assert
    expect(pedido).toBeNull();
  });
});

describe('quando um cliente Premium finaliza a compra', () => {
  it('deve aplicar desconto e enviar email', async () => {
    
    // Arrange
    const user = UserMother.umUsuarioPremium();
    const carrinho = new CarrinhoBuilder()
      .comUser(user)
      .comItens([new Item('Batata', 200)])
      .build();

    const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: true }) };
    const pedidoSalvo = { id: '123', carrinho, totalFinal: 180, status: 'PROCESSADO' };
    const pedidoRepositoryStub = { salvar: jest.fn().mockResolvedValue(pedidoSalvo) };
    const emailMock = { enviarEmail: jest.fn().mockResolvedValue(true) };

    const checkoutService = new CheckoutService(
      gatewayStub,
      pedidoRepositoryStub,
      emailMock
    );

    // Act
    const pedido = await checkoutService.processarPedido(carrinho, 'cartao-1234');

    // Assert
    expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, 'cartao-1234');
    expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
    expect(emailMock.enviarEmail).toHaveBeenCalledWith(
      user.email,
      'Seu Pedido foi Aprovado!',
      `Pedido ${pedidoSalvo.id} no valor de R$${pedidoSalvo.totalFinal}`
    );
    expect(pedido).toBe(pedidoSalvo);
  });
});