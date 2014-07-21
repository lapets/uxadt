---------------------------------------------------------------------
-- 
-- | UxADT
--
-- @Data\/UxADT.hs@
--
--   A library that supports a universal, cross-platform embedded
--   representation for algebraic data type (ADT) values.
--
--   Web:     uxadt.org
--   Version: 0.0.13.0
--
--

----------------------------------------------------------------
-- 

{-# LANGUAGE DeriveDataTypeable, ScopedTypeVariables #-}

module Data.UxADT
  where

import Data.Ratio
import Data.Data
import Text.JSON
import Control.Monad.State

----------------------------------------------------------------
-- | UxADT Data type definition.

type Variable = String
type Constructor = String

data UxADT =
    V Variable
  | B Bool
  | R Rational
  | S String
  | C Constructor [UxADT]
  | L [UxADT]
  | None
  deriving (Show, Eq)

----------------------------------------------------------------
-- | Conversion from arbitrary algebraic data type values to
--   UxADT values.

uxadt :: Data a => a -> UxADT
uxadt x =
  let -- Helper function for conversion from lists.
      mkCons :: [UxADT] -> UxADT
      mkCons [x, L xs] = L $ x:xs
      mkCons _         = None

      rep = dataTypeRep (constrType $ toConstr x)
      ty = dataTypeName $ dataTypeOf x      
  in if ty == "Prelude.Bool" then
       B (case show (toConstr x) of "True" -> True ; "False" -> False)
     else if rep == IntRep then
       R (toRational (read (show (toConstr x)) :: Integer))
     else if rep == FloatRep then
       R (toRational (read (show (toConstr x)) :: Float))
     else if ty == "Prelude.Double" then
       R (toRational (read (show (toConstr x)) :: Double))
     else if ty == "Prelude.[]" then
       case (show (toConstr x)) of
         "(:)" -> mkCons (gmapQ uxadt x)
         "[]" -> L []
     else if ty == "Prelude.(,)" then
       L (gmapQ uxadt x)
     else
       C (show (toConstr x)) (gmapQ uxadt x)

----------------------------------------------------------------
-- | Useful synonym.

toUxADT :: Data a => a -> UxADT
toUxADT = uxadt

----------------------------------------------------------------
-- | Conversion to an algebraic data type value from a UxADT
--   value.

fromUxADT :: Data a => DataType -> UxADT -> a
fromUxADT ty u =
  let constrByName :: String -> DataType -> Constr
      constrByName c' t = head [c | c <- dataTypeConstrs t, showConstr c == c']
  in case u of
    B b    -> fromConstr (constrByName (show b) (dataTypeOf True))
    R r    ->
      let nxt :: Data a => State [Integer] a
          nxt = do {(n:ns) <- get; put ns; return (fromConstr (toConstr n))}
      in evalState (fromConstrM nxt (constrByName ":%" (dataTypeOf r))) [numerator r, denominator r]
    C c [] -> fromConstr (constrByName c ty)
    C c us ->
      let nxt :: Data a => State [UxADT] a
          nxt = do {(u:us) <- get; put us; return (fromUxADT ty u)}
      in evalState (fromConstrM nxt (constrByName c ty)) us
    {-
    L [] -> fromConstr (constrByName "[]" (dataTypeOf []))
    L (u:us) ->
      let nxt :: Data a => State [UxADT] a
          nxt = do {(u:us) <- get; put us; return (fromUxADT ty u)}
      in evalState (fromConstrM nxt (constrByName c ty)) us
    -}
    _      ->
      error "UxADT value cannot be converted to native Haskell value."
       
----------------------------------------------------------------
-- | Translations between the native UxADT representation and a
--   native JSON representation.

instance JSON UxADT where
  showJSON u = case u of
    B b    -> JSBool b
    R r    -> JSRational True r
    S s    -> JSString $ toJSString s
    C c us -> makeObj [(c, showJSON us)]
    L us   -> JSArray (map showJSON us)
    _      -> JSNull

  readJSON j = case j of
    JSBool b          -> Ok $ B b
    JSRational True r -> Ok $ R $ r
    JSString s        -> Ok $ S $ fromJSString s
    JSObject o        ->
      case fromJSObject o of
        [(c, js)] ->
          case readJSONs js of 
            Ok us -> Ok $ C c us
            _     -> Error "JSON not a value UxADT value."
        _ -> Error "JSON not a value UxADT value."
    JSArray js        ->
      case readJSONs j of 
        Ok us -> Ok $ L us
        _     -> Error "JSON not a value UxADT value."
    _ -> Error "JSON not a value UxADT value."

--eof