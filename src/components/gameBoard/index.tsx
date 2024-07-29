import React, {useState} from 'react';
import {View, ToastAndroid, TouchableOpacity} from 'react-native';
import Tube from '../tube';
import {styles} from './styles';
import {THEME} from '../../theme';
import Ball from '../ball';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import { SCREEN } from '../../constants/screens';
import { useNavigation } from '@react-navigation/native';

type TubeColor = 'red' | 'blue' | 'green' | 'yellow';
type TubeType = TubeColor[];
type TubesState = TubeType[];

const shuffleArray = (array: any) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const generateInitialState = (): TubesState => {
  const colors = [THEME.RED, THEME.BLUE, THEME.GREEN, THEME.YELLOW];

  return [
    shuffleArray([...colors]),
    shuffleArray([...colors]),
    shuffleArray([...colors]),
    shuffleArray([...colors]),
    [],
    [],
  ];
};

const GameBoard: React.FC = () => {
  const navigation:any = useNavigation()
  const [tubes, setTubes] = useState<TubesState>(generateInitialState);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);

  const handleTubePress = (index: number) => {
    if (selectedTube === null) {
      if (tubes[index].length > 0) {
        setSelectedTube(index);
      } else {
        ToastAndroid.show('Select a non-empty tube!', ToastAndroid.SHORT);
      }
    } else {
      if (index !== selectedTube) {
        moveBall(selectedTube, index);
      }
      setSelectedTube(null);
    }
  };

  const moveBall = (fromIndex: number, toIndex: number) => {
    const newTubes = [...tubes];
    const fromTube = newTubes[fromIndex];
    const toTube = newTubes[toIndex];

    if (fromTube.length > 0 && toTube.length < 4) {
      const colorToMove = fromTube[0];
      const ballsToMove: TubeColor[] = [];
      while (fromTube.length > 0 && fromTube[0] === colorToMove) {
        ballsToMove.push(fromTube.shift()!);
      }
      if (toTube.length === 0 || toTube[0] === colorToMove) {
        toTube.unshift(...ballsToMove);
        setTubes(newTubes);
        checkWinCondition(newTubes);
      } else {
        fromTube.unshift(...ballsToMove);
        ToastAndroid.show(
          'Invalid move: Ball color does not match!',
          ToastAndroid.SHORT,
        );
      }
    } else {
      ToastAndroid.show('Invalid move!', ToastAndroid.SHORT);
    }
  };

  const checkWinCondition = (currentTubes: TubesState) => {
    const isCompleteTube = (tube: TubeType) =>
      tube.length === 4 && tube.every(ball => ball === tube[0]);
    const filledTubesCount = currentTubes
      .slice(0, 6)
      .filter(isCompleteTube).length;
    const lastTwoTubesEmpty = currentTubes
      .slice(4)
      .every(tube => tube.length === 0);
    if (filledTubesCount >= 4 || lastTwoTubesEmpty) {
      ToastAndroid.show('You Win!', ToastAndroid.SHORT);
      navigation.navigate(SCREEN.HOME);
    }
  };

  const getTopBallColor = (index: number) => {
    return tubes[index].length > 0 ? tubes[index][0] : THEME.WHITE;
  };

  return (
    <View style={styles.container}>
      <View style={styles.tubeContainer}>
        {tubes.map((balls, index) => (
          <View
            key={index}
            style={{
              height: heightPercentageToDP(30),
              justifyContent: 'flex-end',
            }}>
            {selectedTube === index && (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Ball color={getTopBallColor(selectedTube)} />
              </View>
            )}
            <TouchableOpacity onPress={() => handleTubePress(index)}>
              <Tube
                key={index}
                balls={balls}
                onPress={() => handleTubePress(index)}
                selected={index === selectedTube}
                hideTopBall={index === selectedTube}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

export default GameBoard;
