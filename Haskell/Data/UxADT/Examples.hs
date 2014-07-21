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
-- | Example

data Tree =
    Node Tree Tree
  | Twig Tree
  | Leaf Integer
  | Stub Rational
  | Nest Bool
  deriving (Typeable, Data, Show, Eq)

js = showJSON $ uxadt (Node (Node (Leaf 0) (Leaf 1)) (Leaf 2))

treeTy = dataTypeOf (Leaf 4)

check = fromUxADT treeTy (C "Node" [(C "Node" [C "Stub" [R (5 % 6)], C "Nest" [B True]]), C "Nest" [B True]]) :: Tree

--eof