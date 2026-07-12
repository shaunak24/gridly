import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useGameEndFlow, type UseGameEndFlowOptions } from '../hooks/useGameEndFlow';
import { GameEndBar } from './GameEndBar';
import { GameModal } from './GameModal';

interface GameEndExperienceProps extends UseGameEndFlowOptions {
  endAreaStyle?: StyleProp<ViewStyle>;
}

export function GameEndExperience({ endAreaStyle, ...flowOptions }: GameEndExperienceProps) {
  const flow = useGameEndFlow(flowOptions);

  if (!flow.isFinished) {
    return null;
  }

  return (
    <>
      <View style={[styles.endArea, endAreaStyle]}>
        <GameEndBar {...flow.endBarProps} />
      </View>

      <GameModal visible={flow.winModalVisible} {...flow.winModalProps} />
      <GameModal visible={flow.lossModalVisible} {...flow.lossModalProps} />
    </>
  );
}

const styles = StyleSheet.create({
  endArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
});
