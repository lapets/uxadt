---------------------------------------------------------------------
-- 
-- | UxADT
--
-- @Data\/UxADT\/Examples.hs@
--
--   Small examples that illustrate how the UxADT module can be
--   used.
--
--

----------------------------------------------------------------
-- 

{-# LANGUAGE DeriveDataTypeable #-}

module Data.UxADT.Examples
  where

import Data.Ratio
import Data.Data
import Text.JSON
import Data.UxADT

----------------------------------------------------------------
-- | Example with monomorphic, recursive types.

data Color =
    Red
  | Blue
  deriving (Typeable, Data, Show, Eq)
    
data Tree =
    Many [Tree]
  | Two Tree Tree
  | One Tree
  | LeafB Bool
  | LeafR Rational
  | LeafI Integer
  | LeafS String
  | LeafC Color
  | Leaf
  deriving (Typeable, Data, Show, Eq)

js = showJSON $ uxadt (Two (Two (LeafI 0) (LeafI 1)) (LeafI 2))

treeTy = dataTypeOf (Leaf)
colorTy = dataTypeOf (Red)

dat = Two (Two (LeafR (5 % 6)) (LeafS "Testing.")) (Many [LeafC Red, LeafB False,LeafB True])
ux = (C "Two" [(C "Two" [C "LeafR" [R (5 % 6)], C "LeafS" [S "Testing."]]), C "Many" [L [C "LeafC" [C "Red" []], C "LeafB" [B False], C "LeafB" [B True]]]])

datToUx = uxadt dat
uxToDat = fromUxADT [treeTy, colorTy] ux :: Tree

--eof