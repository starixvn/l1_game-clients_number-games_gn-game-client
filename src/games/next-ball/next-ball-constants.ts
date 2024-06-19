import { buildVersion } from "../../_shared/constants";
import { BallStatus } from "../../components/game-components/ball";

export enum NextBallBetOptions {
    OVER = "over",
    UNDER = "under",
    ODD = "odd",
    EVEN = "even",
}

export const NextBallBetOptionsPercentageColor = {
    over: "#98CDFF",
    under: "#F9BCB9",
    odd: "#98CDFF",
    even: "#F9BCB9",
};

export const defaultRoundData = [
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
];

export const BetChoiceImagesData = {
    [NextBallBetOptions.OVER]: {
        src: `/static/images/next-ball/2x/bg-${NextBallBetOptions.OVER}.webp?v=${buildVersion}`,
        blur: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALEAAABeCAYAAABsO/WSAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARuSURBVHgB7dtNT1xVGMDx55xzZ4CUQTBqjCZ0TDcuTDomsjBxMe66MGm/QSGUJq5KDXtgjylrqIF+gmq/QMdN28Q28gWajE10oVHGMmXe7r3He66FlPAirZTOk/x/CTD3cofVPyfPHO418ppdmVutitiK8/Z8anzZGCl7L6NGZFSAQ3iRRtZK3aRmIzHxrZtLM7XDrjVywiZn10YLhfSSeHM5O6ykcWk0jsckSUbEp4XsZ0m8d9lXQYDDGNMTFzXFuacyMPiLWNeud3udL9eXv67vu1ZOSFhxnUQXUx9NJvHwaLf7ofS67xIrTkRx4FcZHHos1nYWVpamFl/83f+OOMRrxM1LGlU7nbPSaY8TLl4La1syPPLTvpBfOeIwNhQjmfepmyVenBZjYim9dS8EfX1laXo5PyevIKy+1ri1Tmu83G6dI16cKue2spDvN7qx+Wh9eaph5SVdnVu7IcmZu82/J8qt7Y8JGKcubA5ki2c2CaSz4Tg67hvzXYfI3457o9VnzQrx4o3qtM+GD3rXspcLxxonsoDLxYK/nY0PlbD6Av0gGynERs1P/3Mlfh7w3fb2uXz+BfpFEpfEmqeVI2fifAciW4EJGP0oTYfEWCkfGXHYQgsjBAGjnx0acbYLMZ8mA7PMwOh3B0Yc5uAs4IXm1oQA/e7AiPMPctkIEWYOoN/ti3jmm+8m4+5YOdzAA2iwJ+IwRhhn5reffSKAFnsiLtr0Urf9QZkxAprsHSecucZ2GrTZjTifhXtjrMJQZzdia83lbJQQQJv83ol8X9i7KjsS0ChfiQs2rWajhAAa5RFbYy/2uu8JoFEesbe+Eh6pBzSKwu2WPnXl8MgHoJGNorhCwNDMGmPLPj32o3ZA37HGS5l5GJq99CP7QL8hYqhnxRvul4BqrMRQj4ihHhFDPSKGekQM9YgY6hEx1CNiqEfEUI+IoR4RQz0ihnpEDPWIGOoRMdQjYqhHxFCPiKEeEUM9IoZ6RAz1iBjqETHUI2KoR8RQj4ihHhFDPSKGekQM9YgY6hEx1CNiqEfEUI+IoR4RQz0ihnpEDPWIGOoRMdQjYqhHxFCPiKEeEUM9IoZ6RAz1iBjqETHUI2KoR8RQj4ihHhFDPSvG161tCaCVTUUaxvQE0Ma5LfGp1LNxIt1w0ZYA2ljXEm/Tuo3jaMO5TVZjqBJGYGe36jeXZmp2fXmqkZ27NTD4RAAtBoceixFTC6/z3QmXmOXiwJMGH/CgQei0WPytbpL2Yjh24dvDBz80Pvv8q05U3LzQ676/cxroOyHg4ZGH2ave9ZUbV2vh3G6tj+7feTDxxQVTKP5ZjXvviPcFAfpJCPhMaSPblWgurn47vbxzfs+S++jendq/If9RDREnSUmAflAo/i7DpZ+zkLcXV5amF178nTnoDVfmVqvWu7XUD5U77XGJe29Lmg6yOuPUhN0ya9sSFf7KA3bRZs1Lshh2I/Zde9Qfeh7zZHbV+eywIsAp8T78E07qxsuPiUm+PyjeHf8A2Oh6jYaMNRUAAAAASUVORK5CYII=`,
    },
    [NextBallBetOptions.ODD]: {
        src: `/static/images/next-ball/2x/bg-${NextBallBetOptions.ODD}.webp?v=${buildVersion}`,
        blur: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALEAAABeCAYAAABsO/WSAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAASGSURBVHgB7dxfT1tlHMDx33MOa+m/rTgiinFpnMFdKYne2zdg3O7VFd/AfAfAK5i+Aprp/dgrWC+9s5kxLvPPQDIcBsKBQktLT4/PD9dFtoIsMtZf8v0kHNqTU66+efI7z0lxcoyFzyrlMAw+dZKUE5GSP1UU4GjRk58lEVeXXm85TqQ+8121Ji+RG3RS4x0J3Wy2sV2+EEWS32nIuXZHwrgrwFHicER6I6F0UilpZbLSSadlJ5+XvWwucuJqSa93Jw5lcaZajeQUPRfxt198Oevi7tyl5YdyPtoU4P/SuLeLRdnyP9vFMX/GVWPXm/cxL8kpOBSxBpxuNedKv/0iqU5bgNPWSaVlt1CQx2++Jfvp9KnE/DTiW59XKuf29xcuP7hPwDgTmxfHTyXmUA8LlUopcG5h6uefigSMs5JpNUXvucQl03u5wtVr709v3b5Xr8sLCvQQJsHs2MZ6iYBx1rS5yZUVeefB/ZJOAjrSygs6GCduXZ95eOXHe0SMV0rn5dW3L+lNYC12ybWT7mIEup022mwSMF45bVA3FSb+fFQOE/eDjrkn+VwQOinpbAIMi4nVVQ255EO+60P+zwdsQeIjTrVZhTFc+iGPnCDkQIAhpSEXN9an/cbDzeOuI2IMtcmVP2S0uVvxzzG+OuoaIsZQC+PY3+z96reBezf9WDE96BoixtDTXYuJ1Uc+ZDdwrCBimDD+15rkGo3yoLGCiGGG363wxbrZZ3criBhm5BsNGdtYLwY9ObQaEzFMGV9bE+fcjX+vxkQMU/Tpsp+NiyNdKffPETHM0dk4Cd2N/nsihjmZZlP3j8v9kYKIYY4+ANHvf4axXNX3RAyT8o1trfdjfU3EMCnX2PFHV9bXRAyT9FG0HytKOhcTMcxKtff0V4mIYdZoq6U3d9NEDLPCblf0m0lEDLN0q00RMcx6EjE3drBL/0urc3KBiGEeEcM8IoZ5RAzziBjmETHMI2KYR8Qwj4hhHhHDPCKGeUQM84gY5hExzCNimEfEMI+IYR4RwzwihnlEDPOIGOYRMcwjYphHxDCPiGEeEcM8IoZ5RAzziBjmETHMI2KYR8Qwj4hhHhHDPCKGeUQM84gY5hExzCNimEfEMI+IYR4RwzwihnlEDPOIGOYRMcwjYphHxDCPiGEeEcM8IoZ5RAyzOqm0JIksBy6RpU46LYA1cRiK7zcK4lDqrUxWAGta2Zxov8FMtVpvZbORVg1Y0UmlZLdQiHy/tX9m4iT5Zv31NwSwYvPiuD8mi/r6IOJeIF8/npyM/IoswLDTVXh9YkJiJ/P6/iBivyRHziXzy5ffFcYKDDPt8/f3rkh3JJz33S7puafF3q7Xv//kow/d1msXy+ejTQnjWIBh0g94LzM6f71aneufP7TsLtbrNQ25URwra8SZVlOAYbCTL8jS1NRzASs36AMLlUopSNzddKddGl9bk1yjIalOm9UZZ0ZXXX2Y4XcgZKs4Js1Codb1I6/uRjx7rTvuD/mYy0FPKoFzH/RESv7iogBnIBGJfG9RkiR3/MbD4qB4+/4GDYmG7MFnTw4AAAAASUVORK5CYII=`,
    },
};
