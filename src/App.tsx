import Header from "./components/Header";
import { Image } from "./components/Image";

import homeImage from "../src/assets/images/banners/home_image.png";

function App() {
  return (
    <>
      <Header />
      <Image
        src={homeImage}
        alt="Médica sorrindo na mesa com caneta na mão para agendamento"
        width={500}
        height={365}
        aspectRatio="16 / 9"
        objectFit="cover"
        priority
        fullWidth
      />
    </>
  );
}

export default App;
