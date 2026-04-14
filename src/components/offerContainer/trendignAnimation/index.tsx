import React, { useState, useEffect } from 'react'
import { View, Image, Animated, Easing } from 'react-native'

import images from '../../../utils/images'
import { windowWidth } from '@src/themes/appConstant'
import { styles } from './styles.css'

export function TrendingAnimation() {
  const animations = new Animated.Value(0)
  const [opacitiess, setOpacities] = useState([])
  const data = [
    images.offerProduct1,
    images.offerProduct2,
    images.offerProduct3,
    images.offerProduct1,
  ]

  const length = data.length
  var opacities = []

  useEffect(() => {
    data.map((item, index) => {
      opacities.push(
        animations.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, 1, 0],
        }),
      )
    })
    setOpacities(opacities)
    startanim()
  }, [])

  const startanim = () => {
    Animated.loop(
      Animated.timing(animations, {
        toValue: length - 1,
        duration: 3000 * length,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }
  return (
    <View style={styles.background}>
      <View style={styles.headerContent}>
        <Image
          style={{
            position: 'absolute',
            width: windowWidth(250),
            height: 40,
            bottom: -215,
            left: -90,
          }}
          source={images.base}
        ></Image>
        {data.map((item, index) => {
          const opacity = opacitiess[index]
          return (
            <Animated.Image
              style={[
                {
                  height: 115,
                  width: 120,
                  position: 'absolute',
                  resizeMode: 'contain',
                  top: 80,
                  left: -40,
                },
                { opacity },
              ]}
              source={item}
            />
          )
        })}
      </View>
    </View>
  )
}
