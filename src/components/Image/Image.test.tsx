import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { MemoryRouter } from "react-router-dom";

import { Image } from "../Image";

import "@testing-library/jest-dom";

const renderImage = (props: Partial<React.ComponentProps<typeof Image>> = {}) =>
  render(
    <MemoryRouter>
      <Image src="/smartphone.jpg" alt="Smartphone" {...props} />
    </MemoryRouter>,
  );

const fireMousePointerMove = (
  element: HTMLElement,
  clientX: number,
  clientY: number,
) => {
  const event = new MouseEvent("pointermove", {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
  });

  Object.defineProperty(event, "pointerType", {
    value: "mouse",
    configurable: true,
  });

  fireEvent(element, event);
};

describe("Image", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("deve renderizar a imagem", () => {
    renderImage();

    const image = screen.getByRole("img", { name: "Smartphone" });

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/smartphone.jpg");
    expect(image).toHaveAttribute("alt", "Smartphone");
  });

  it("deve aplicar loading lazy por padrão", () => {
    renderImage();

    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
  });

  it("deve aplicar loading eager quando priority estiver habilitado", () => {
    renderImage({
      priority: true,
    });

    expect(screen.getByRole("img")).toHaveAttribute("loading", "eager");
  });

  it("deve aplicar decoding async", () => {
    renderImage();

    expect(screen.getByRole("img")).toHaveAttribute("decoding", "async");
  });

  it("deve aplicar width e height", () => {
    renderImage({
      width: 400,
      height: 300,
    });

    const image = screen.getByRole("img");

    expect(image).toHaveAttribute("width", "400");
    expect(image).toHaveAttribute("height", "300");
  });

  it("deve aplicar objectFit e objectPosition", () => {
    renderImage({
      objectFit: "contain",
      objectPosition: "top center",
    });

    const image = screen.getByRole("img");

    expect(image).toHaveStyle({
      objectFit: "contain",
      objectPosition: "top center",
    });
  });

  it("deve utilizar cover e center como valores padrão", () => {
    renderImage();

    expect(screen.getByRole("img")).toHaveStyle({
      objectFit: "cover",
      objectPosition: "center",
    });
  });

  it("deve preservar estilos personalizados da imagem", () => {
    renderImage({
      style: {
        borderRadius: "12px",
        opacity: 0.8,
      },
    });

    expect(screen.getByRole("img")).toHaveStyle({
      borderRadius: "12px",
      opacity: "0.8",
    });
  });

  it("deve aplicar className personalizado na imagem", () => {
    renderImage({
      className: "produto__imagem",
    });

    expect(screen.getByRole("img")).toHaveClass(
      "image__element",
      "produto__imagem",
    );
  });

  it("deve aplicar a classe base do container", () => {
    renderImage();

    expect(screen.getByRole("img").closest("figure")).toHaveClass("image");
  });

  it("deve aplicar a classe de largura total", () => {
    renderImage({
      fullWidth: true,
    });

    expect(screen.getByRole("img").closest("figure")).toHaveClass(
      "image",
      "image--full-width",
    );
  });

  it("não deve aplicar a classe de largura total por padrão", () => {
    renderImage();

    expect(screen.getByRole("img").closest("figure")).not.toHaveClass(
      "image--full-width",
    );
  });

  it("deve aplicar a classe de efeito 3D", () => {
    renderImage({
      enable3D: true,
    });

    expect(screen.getByRole("img").closest("figure")).toHaveClass("image--3d");
  });

  it("não deve aplicar a classe de efeito 3D por padrão", () => {
    renderImage();

    expect(screen.getByRole("img").closest("figure")).not.toHaveClass(
      "image--3d",
    );
  });

  it("deve aplicar uma classe personalizada no container", () => {
    renderImage({
      containerClassName: "produto__image-wrapper",
    });

    expect(screen.getByRole("img").closest("figure")).toHaveClass(
      "image",
      "produto__image-wrapper",
    );
  });

  it("deve aplicar aspectRatio no container", () => {
    renderImage({
      aspectRatio: "16 / 9",
    });

    expect(screen.getByRole("img").closest("figure")).toHaveStyle({
      aspectRatio: "16 / 9",
    });
  });

  it("deve aplicar estilos personalizados no container", () => {
    renderImage({
      containerStyle: {
        maxWidth: "500px",
        margin: "0 auto",
      },
    });

    expect(screen.getByRole("img").closest("figure")).toHaveStyle({
      maxWidth: "500px",
      margin: "0 auto",
    });
  });

  it("deve iniciar com a classe de loading", () => {
    renderImage();

    expect(screen.getByRole("img").closest("figure")).toHaveClass(
      "image--loading",
    );
  });

  it("deve remover a classe de loading após o carregamento", () => {
    renderImage();

    const image = screen.getByRole("img");

    fireEvent.load(image);

    expect(image.closest("figure")).not.toHaveClass("image--loading");
  });

  it("deve remover a classe de erro após o carregamento", () => {
    renderImage();

    const image = screen.getByRole("img");

    fireEvent.error(image);

    expect(image.closest("figure")).toHaveClass("image--error");

    fireEvent.load(image);

    expect(image.closest("figure")).not.toHaveClass("image--error");
  });

  it("deve renderizar o placeholder enquanto a imagem estiver carregando", () => {
    renderImage({
      placeholder: <span>Carregando imagem...</span>,
    });

    expect(screen.getByText("Carregando imagem...")).toBeInTheDocument();
  });

  it("deve marcar o placeholder como conteúdo decorativo", () => {
    renderImage({
      placeholder: <span>Loading</span>,
    });

    const placeholder = document.querySelector(".image__placeholder");

    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
    expect(placeholder).toHaveTextContent("Loading");
  });

  it("deve remover o placeholder após o carregamento", () => {
    renderImage({
      placeholder: <span>Carregando...</span>,
    });

    const image = screen.getByRole("img");

    expect(screen.getByText("Carregando...")).toBeInTheDocument();

    fireEvent.load(image);

    expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
  });

  it("não deve renderizar placeholder quando nenhum placeholder for informado", () => {
    renderImage();

    expect(
      document.querySelector(".image__placeholder"),
    ).not.toBeInTheDocument();
  });

  it("deve aplicar a classe de erro quando a imagem falhar", () => {
    renderImage();

    const image = screen.getByRole("img");

    fireEvent.error(image);

    expect(image.closest("figure")).toHaveClass("image--error");
    expect(image.closest("figure")).not.toHaveClass("image--loading");
  });

  it("deve utilizar o fallback quando a imagem falhar", () => {
    renderImage({
      fallback: "/fallback.jpg",
    });

    const image = screen.getByRole("img");

    fireEvent.error(image);

    expect(image).toHaveAttribute("src", "/fallback.jpg");
  });

  it("não deve alterar o src quando não houver fallback", () => {
    renderImage();

    const image = screen.getByRole("img");

    fireEvent.error(image);

    expect(image).toHaveAttribute("src", "/smartphone.jpg");
  });

  it("deve chamar onLoad personalizado após o carregamento", () => {
    const onLoad = jest.fn();

    renderImage({
      onLoad,
    });

    const image = screen.getByRole("img");

    fireEvent.load(image);

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "load",
      }),
    );
  });

  it("deve chamar onError personalizado quando ocorrer erro", () => {
    const onError = jest.fn();

    renderImage({
      onError,
    });

    const image = screen.getByRole("img");

    fireEvent.error(image);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
      }),
    );
  });

  it("deve renderizar a imagem dentro de um link quando to for informado", () => {
    renderImage({
      to: "/smartphones/iphone-15-pro-max",
    });

    const link = screen.getByRole("link");

    expect(link).toHaveAttribute("href", "/smartphones/iphone-15-pro-max");
    expect(link).toContainElement(screen.getByRole("img"));
  });

  it("não deve renderizar link quando to não for informado", () => {
    renderImage();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("deve encaminhar a ref para o elemento img", () => {
    const ref = createRef<HTMLImageElement>();

    renderImage({
      ref,
    });

    expect(ref.current).toBeInstanceOf(HTMLImageElement);
    expect(ref.current).toBe(screen.getByRole("img"));
  });

  it("deve ignorar pointer move quando o efeito 3D estiver desabilitado", () => {
    renderImage({
      enable3D: false,
    });

    const figure = screen.getByRole("img").closest("figure");

    expect(figure).toBeInTheDocument();

    fireEvent.pointerMove(figure as HTMLElement, {
      pointerType: "mouse",
      clientX: 100,
      clientY: 100,
    });

    expect(figure).not.toHaveStyle({
      "--image-rotate-x": "0deg",
      "--image-rotate-y": "0deg",
    });
  });

  it("deve ignorar pointer move quando o pointer não for do mouse", () => {
    renderImage({
      enable3D: true,
    });

    const figure = screen.getByRole("img").closest("figure");

    expect(figure).toBeInTheDocument();

    fireEvent.pointerMove(figure as HTMLElement, {
      pointerType: "touch",
      clientX: 100,
      clientY: 100,
    });

    expect(figure).not.toHaveStyle({
      "--image-rotate-x": "0deg",
      "--image-rotate-y": "0deg",
    });
  });

  it("deve aplicar a rotação 3D conforme a posição do mouse", () => {
    renderImage({
      enable3D: true,
    });

    const figure = screen.getByRole("img").closest("figure");

    expect(figure).toBeInTheDocument();

    jest.spyOn(figure as HTMLElement, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireMousePointerMove(figure as HTMLElement, 200, 0);

    expect(figure).toHaveStyle({
      "--image-rotate-x": "6.00deg",
      "--image-rotate-y": "6.00deg",
    });
  });

  it("deve resetar a rotação 3D ao sair do container", () => {
    renderImage({
      enable3D: true,
    });

    const figure = screen.getByRole("img").closest("figure");

    expect(figure).toBeInTheDocument();

    jest.spyOn(figure as HTMLElement, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireMousePointerMove(figure as HTMLElement, 200, 0);

    expect(figure).toHaveStyle({
      "--image-rotate-x": "6.00deg",
      "--image-rotate-y": "6.00deg",
    });

    fireEvent.pointerLeave(figure as HTMLElement);

    expect(figure).toHaveStyle({
      "--image-rotate-x": "0deg",
      "--image-rotate-y": "0deg",
    });
  });

  it("deve calcular corretamente a rotação 3D no centro da imagem", () => {
    renderImage({
      enable3D: true,
    });

    const figure = screen.getByRole("img").closest("figure");

    expect(figure).toBeInTheDocument();

    jest.spyOn(figure as HTMLElement, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 50,
      width: 200,
      height: 100,
      right: 300,
      bottom: 150,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    });

    fireMousePointerMove(figure as HTMLElement, 200, 100);

    expect(figure).toHaveStyle({
      "--image-rotate-x": "0.00deg",
      "--image-rotate-y": "0.00deg",
    });
  });

  it("deve encaminhar atributos adicionais para a imagem", () => {
    renderImage({
      id: "smartphone-image",
      title: "iPhone 15 Pro Max",
      draggable: false,
    });

    const image = screen.getByRole("img");

    expect(image).toHaveAttribute("id", "smartphone-image");
    expect(image).toHaveAttribute("title", "iPhone 15 Pro Max");
    expect(image).toHaveAttribute("draggable", "false");
  });

  it("deve manter a imagem dentro do figure", () => {
    renderImage();

    const figure = screen.getByRole("img").closest("figure");

    expect(figure).toBeInTheDocument();
    expect(figure).toContainElement(screen.getByRole("img"));
  });
});
