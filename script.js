let frame = 0;

async function call_api(cidade) {
  const api_key = "3fe22fbeb90b39c89628078a8cfd00b4";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${api_key}&lang=pt_br`
    );

    const response_json = await response.json();

    if (response_json.cod != 200) {
      throw new Error(response_json.cod);
    }

    return response_json;
  } catch (error) {
    throw error;
  }
}

function animation_form(form, executar_animacao, div_child) {
  const atual_dimensoes = form.getBoundingClientRect();
  const atual_width = atual_dimensoes.width;
  const atual_height = atual_dimensoes.height;

  form.style.setProperty("--start-width", `${atual_width}px`);
  form.style.setProperty("--start-height", `${atual_height}px`);

  if (executar_animacao === true) {
    frame = 1;
    form.style.animation = "animacao_form_sucesso 0.6s ease forwards";
  } else if (executar_animacao === false) {
    form.style.animation = "animacao_form_falha 0.6s ease forwards";
    frame = 2;
  } else {
    div_child.style.opacity = 1;
    return;
  }

  form.addEventListener("animationend", () => {
    div_child.classList.add("div_animation_opacity");
  });
}

function criar_img_200(master, caminho, descricao, clock) {
  if (descricao === "Clear") {
    if (clock === "01d") {
      caminho = "imagens/clear_sky_day.png";
    } else {
      caminho = "imagens/clear_sky_night.png";
    }
  }

  const img = document.createElement("img");
  img.src = caminho;
  img.classList.add("div_img_info_class");

  master.appendChild(img);
}

function criar_frame_200(form, json_atribute, executar_animacao) {
  const div = document.createElement("div");
  div.id = "informacao";
  div.classList.add("div_opacity");
  form.appendChild(div);

  if (executar_animacao === true) {
    animation_form(form, true, div);
  } else {
    animation_form(form, undefined, div);
  }

  switch (json_atribute.weather[0].main) {
    case "Thunderstorm":
      criar_img_200(div, "imagens/thunderstorm.png");
      break;
    case "Drizzle":
      criar_img_200(div, "imagens/rain.png");
      break;
    case "Rain":
      criar_img_200(div, "imagens/rain.png");
      break;
    case "Snow":
      criar_img_200(div, "imagens/snow.png");
      break;
    case "Clear":
      criar_img_200(
        div,
        undefined,
        json_atribute.weather[0].main,
        json_atribute.weather[0].icon
      );
      break;
    case "Clouds":
      criar_img_200(div, "imagens/clouds.png");
      break;
    default:
      criar_img_200(div, "imagens/mist.png");
  }

  //Cria a temperatura e mostra na div
  const temp_celsius = json_atribute.main["temp"] - 273.15;

  const temp = document.createElement("h3");
  temp.textContent = `${Math.trunc(temp_celsius)}°C`;
  div.appendChild(temp);

  //Cria a descrição e mostra na div
  let descricao_text = json_atribute.weather[0]["description"];
  descricao_text = descricao_text[0].toUpperCase() + descricao_text.slice(1);

  const descricao_h4 = document.createElement("h4");
  descricao_h4.textContent = descricao_text;
  div.appendChild(descricao_h4);

  //Cria a div das informações finais contendo a sensação, humidade e velocidade do vento
  const div_informacoes_finais = document.createElement("div");
  div_informacoes_finais.className = "div_informacoes_finais_class";
  div.appendChild(div_informacoes_finais);

  const sensacao = document.createElement("h5");
  sensacao.textContent = `Sensação: ${Math.trunc(
    json_atribute.main["feels_like"] - 273.15
  )}°C`;
  div_informacoes_finais.appendChild(sensacao);

  const humidade = document.createElement("h5");
  humidade.textContent = `Humidade: ${json_atribute.main["humidity"]}%`;
  div_informacoes_finais.appendChild(humidade);

  const vento = document.createElement("h5");
  vento.textContent = `Vento: ${Math.trunc(json_atribute.wind["speed"])}km/h`;
  div_informacoes_finais.appendChild(vento);
}

function criar_frame_404(title, form) {
  const div = document.createElement("div");
  div.id = "informacao";
  div.classList.add("d-block", "div_opacity");
  form.appendChild(div);

  title.innerHTML = "Erro";
  animation_form(form, false, div);

  const img_error = document.createElement("img");
  img_error.src = "imagens/404.png";
  img_error.className = "div_img_info_class";

  const p_div_info = document.createElement("p");
  p_div_info.textContent = "Cidade não encontrada :/";

  div.appendChild(img_error);
  div.appendChild(p_div_info);
}

const form = document.querySelector("form");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const city_api = document.querySelector("input[name=input-form]");

  let city_api_value = city_api.value.trim();

  city_api.value = "";

  if (city_api_value == "") {
    city_api_value = "";
    return;
  }

  city_api_value = city_api_value.toLowerCase();
  city_api_value = city_api_value[0].toUpperCase() + city_api_value.slice(1);

  const title_city = document.getElementById("title_weather");

  const div_informacao = document.querySelector("#informacao");

  try {
    const json_retornado = await call_api(city_api_value);

    title_city.innerHTML = `${city_api_value} (${json_retornado.sys.country})`;

    switch (frame) {
      case 0:
        criar_frame_200(form, json_retornado, true);
        break;
      case 1:
        div_informacao.parentNode.removeChild(div_informacao);

        criar_frame_200(form, json_retornado, false);
        break;
      default:
        div_informacao.parentNode.removeChild(div_informacao);

        criar_frame_200(form, json_retornado, true);
    }
  } catch (error) {
    switch (frame) {
      case 0:
        criar_frame_404(title_city, form);
        break;
      case 1:
        div_informacao.parentNode.removeChild(div_informacao);

        criar_frame_404(title_city, form);
        break;
      default:
        return;
    }
  }
});
