from dataclasses import dataclass


@dataclass
class Corner:
    isCornerTopLeft: bool
    isCornerTopRight: bool
    isCornerBottomRight: bool
    isCornerBottomLeft: bool
    isMandatory: bool = False
    isUsed: bool = False

    def GetStyle(self) -> str:
        style = ''
        if self.isCornerTopLeft:
            style += 'edge-corner-top-left'
        if self.isCornerTopRight:
            style += 'edge-corner-top-right'
        if self.isCornerBottomRight:
            style += 'edge-corner-bottom-right'
        if self.isCornerBottomLeft:
            style += 'edge-corner-bottom-left'

        return style

    @staticmethod
    def CornerInside(isMandatory=False):
        return Corner(False, False, False, False, isMandatory=isMandatory)

    @staticmethod
    def CornerTopLeft(isMandatory=False):
        return Corner(True, False, False, False, isMandatory=isMandatory)

    @staticmethod
    def CornerTopRight(isMandatory=False):
        return Corner(False, True, False, False, isMandatory=isMandatory)

    @staticmethod
    def CornerBottomRight(isMandatory=False):
        return Corner(False, False, True, False, isMandatory=isMandatory)

    @staticmethod
    def CornerBottomLeft(isMandatory=False):
        return Corner(False, False, False, True, isMandatory=isMandatory)


@dataclass()
class EdgeHorizontal:
    isMandatory: bool = False
    isUsed: bool = False


@dataclass()
class EdgeVertical:
    isMandatory: bool = False
    isUsed: bool = False


class EdgeGapVertical:
    isUsed: bool = False


class EdgeGapHorizontal:
    isUsed: bool = False


@dataclass()
class Square:
    color: str
    isUsed: bool = False


@dataclass()
class Cell:
    square: Square = None
    numberOfTriangles: int = 0
    isUsed: bool = False


class EndRight:
    isUsed: bool = False


class EndLeft:
    isUsed: bool = False


class EndTop:
    isUsed: bool = False


class EndSpaceHorizontal:
    isUsed: bool = False


class EndSpaceVertical:
    isUsed: bool = False


class EndSpaceVerticalCell:
    isUsed: bool = False


@dataclass()
class LevelSelectCell:
    levelNumber: int
    levelShortDisplayName: str
    levelDisplayName: str
