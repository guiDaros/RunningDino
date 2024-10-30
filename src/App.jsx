import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import asteroide from "./assets/tessauroREX.png";
import dinossaro from "./assets/TESSAURAOREX.png";
import tessauro from "./assets/braquissaro.png";
import tiranossaro from "./assets/tiranossaro.png";

import minoxidil from './assets/tadala.png'

// Animação de pulo para o personagem
const jump = keyframes`
  0% {
    bottom: 0;
  }
  50% {
    bottom: 150px;
  }
  100% {
    bottom: 0;
  }
`;

// Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  position: relative;
`;

const FixedTitle = styled.h1`
  position: absolute;
  top: 10px;
  font-size: 24px;
  color: #333;
`;

const FrostedScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  z-index: 10;

  img {
    width: 200px;
  }

  h1 {
    color: #278;
    font-size: 50px;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const GameArea = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  width: 900px;
  height: 300px;
  background-color: #e5e5e5;
  overflow: hidden;
  position: relative;
`;

const Character = styled.div`
  width: 100px;
  height: 100px;
  position: absolute;
  bottom: 0;
  left: 50px;
  background-image: url("${dinossaro}");
  background-size: cover;
  background-repeat: no-repeat;
  ${(props) =>
    props.$isJumping &&
    css`
      animation: ${jump} 0.4s ease;
    `}
`;
const Obstacle = styled.div`
  width: 40px;
  height: 100px;
  position: absolute;
  bottom: 0;
  background-color: transparent;
  background-image: url("${minoxidil}");
  background-size: cover; /* Ajusta a imagem para cobrir o elemento */
  background-repeat: no-repeat; /* Evita que a imagem se repita */
`;

const GameOverScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  backdrop-filter: blur(8px);
`;

const GameOverTitle = styled.h1`
  font-size: 50px;
  margin-bottom: 20px;
  color: #333;
`;

const PlayerScore = styled.h2`
  font-size: 24px;
  color: #666;
  margin-bottom: 15px;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
`;

const Icon = styled.img`
  width: 250px;
  height: 250px;
`;

const ScoreBoard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  width: 350px;
  text-align: center;
  position: relative;
  top: 5 0px;
`;

const ScoreList = styled.div`
  margin: 0 20px;
`;

const RetryButton = styled(Button)`
  margin-bottom: 20px;
`;

function App() {
  const [nickname, setNickname] = useState("");
  const [showFrostedScreen, setShowFrostedScreen] = useState(true);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [obstacleSpeed, setObstacleSpeed] = useState(35); // Velocidade inicial aumentada
  const [scores, setScores] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    if (!nickname) {
      alert("Por favor, insira um apelido para começar!");
      return;
    }
    setShowFrostedScreen(false);
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    setObstacleSpeed(35);
  };

  const handleJump = () => {
    if (!isJumping && !gameOver && gameStarted) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 400);
    }
  };

  const saveScore = async () => {
    try {
      await addDoc(collection(db, "scores"), {
        nickname,
        score,
        date: new Date(),
      });
    } catch (error) {
      console.error("Erro ao salvar pontuação: ", error);
    }
  };

  const fetchScores = async () => {
    const scoresCollection = collection(db, "scores");
    const q = query(scoresCollection, orderBy("score", "desc"), limit(20)); // Limitar a 15 primeiros
    const querySnapshot = await getDocs(q);
    const scoresData = querySnapshot.docs.map((doc) => doc.data());
    setScores(scoresData);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space") handleJump();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isJumping, gameOver, gameStarted]);

  useEffect(() => {
    if (gameOver || !gameStarted) return;

    // Define o intervalo inicial para os obstáculos (700ms)
    const obstacleInterval = setInterval(() => {
      console.log("Criando obstáculo"); // Verificação de criação de obstáculo
      setObstacles((prev) => [...prev, { id: Date.now(), position: 900 }]);
    }, 600);

    const scoreInterval = setInterval(() => {
      if (!gameOver) setScore((prev) => prev + 1);
    }, 100);

    return () => {
      clearInterval(obstacleInterval);
      clearInterval(scoreInterval);
    };
  }, [gameOver, gameStarted]);

  // Aumenta a velocidade de movimento dos obstáculos a cada 100 pontos
  // 1. Atualize o useEffect responsável por mover os obstáculos:
  useEffect(() => {
    if (gameOver || !gameStarted) return;

    const moveObstacles = setInterval(() => {
      setObstacles((prevObstacles) =>
        prevObstacles
          .map((obs) => ({ ...obs, position: obs.position - obstacleSpeed }))
          .filter((obs) => obs.position > -50)
      );
    }, 25);

    return () => {
      clearInterval(moveObstacles);
    };
  }, [gameOver, gameStarted, obstacleSpeed]);

  // 2. Substitua o useEffect de incremento de velocidade para este código:
  useEffect(() => {
    if (gameOver || !gameStarted) return;

    // Aumenta a velocidade dos obstáculos a cada 50 pontos
    if (score > 0 && score % 50 === 0) {
      setObstacleSpeed((prevSpeed) => prevSpeed + 5);
    }
  }, [score, gameOver, gameStarted]);


  //mudei aqui
  useEffect(() => {
    obstacles.forEach((obs) => {
      const isColliding = !isJumping && obs.position < 90 && obs.position > 35;

      if (isColliding) {
        setGameOver(true);
        setGameStarted(false);
        saveScore();
        fetchScores();
      }
    });
  }, [obstacles, isJumping]);

  return (
    <AppContainer>
      <FixedTitle>Jogo do Tessauro Rex</FixedTitle>
      {showFrostedScreen && (
        <FrostedScreen>
          <img src={tiranossaro} />
          <h1>Jogo do Tessauro Rex</h1>
          <Title>Digite seu Apelido</Title>
          <Input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <Button onClick={startGame}>Iniciar Jogo</Button>
        </FrostedScreen>
      )}

      <div>
        <h1>Pontuação: {score}</h1>
        <GameArea>
          <Character $isJumping={isJumping} />
          {obstacles.map((obstacle) => (
            <Obstacle
              key={obstacle.id}
              style={{ right: `${900 - obstacle.position}px` }}
            />
          ))}
        </GameArea>
        {gameOver && (
          <GameOverScreen>
            <GameOverTitle>Bateu no Minoxidil</GameOverTitle>
            <PlayerScore>
              {nickname}: {score} pontos
            </PlayerScore>{" "}
            {/* Nome e pontuação do jogador */}
            <RetryButton onClick={() => window.location.reload()}>
              Jogar Novamente
            </RetryButton>
            <IconContainer>
              <Icon src={tessauro} alt="Left Icon" />
              <ScoreBoard>
                <ScoreList>
                  {scores.map((entry, index) => (
                    <p key={index}>
                      {index + 1}. {entry.nickname}: {entry.score}
                    </p>
                  ))}
                </ScoreList>
              </ScoreBoard>
              <Icon src={asteroide} alt="Right Icon" />
            </IconContainer>
          </GameOverScreen>
        )}
      </div>
    </AppContainer>
  );
}

export default App;
