import { View } from 'react-native'
import React from 'react'
import { inmyBag, removeAll } from '@src/constant'
import { newArrivalBigData } from '@src/data/homeScreenTwo'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import { NewArrivalContainer } from '../homeScreen/homeIndex'
import { HeadingCategory } from '@src/commonComponents'

export function InmyBegContainer() {
  return (
    <View>
      <View style={[external.mh_20]}>
        <HeadingCategory value={inmyBag} seeall={removeAll} />
      </View>
      <NewArrivalContainer
        data={newArrivalBigData}
        marginTop={windowHeight(1)}
      />
    </View>
  )
}
