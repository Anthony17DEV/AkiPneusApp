import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { styles } from './style.css'
import { Star, UnCheckedStar } from '@src/utils/icon'

export function CustomRatingBars() {
  const [defaultRating, setDefaultRating] = useState(0)
  const [maxRating, setMaxRating] = useState([1, 2, 3, 4, 5])

  return (
    <View>
      <View style={styles.customRatingBarStyle}>
        {maxRating.map((item, key) => {
          return (
            <TouchableOpacity
              style={styles.touchableStar}
              activeOpacity={0.7}
              key={item}
              onPress={() => setDefaultRating(item)}
            >
              {item >= defaultRating ? <UnCheckedStar /> : <Star />}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
