----------------------------------------------------------------
--
-- UxADT
-- 
-- Text/UxADT.hs
--   Universal (cross-language) extensible representation for
--   algebraic data type instances.

----------------------------------------------------------------
-- 

module Text.UxADT
  where

import Data.String.Utils (join)

----------------------------------------------------------------
-- Data type definition.

type Variable = String
type Constructor = String

data UxADT =
    B Bool
  | I Int
  | F Float
  | D Double
  | S String
  | V Variable
  | C Constructor [UxADT]
  | L [UxADT]
  | None
  deriving  (Eq)

class ToUxADT a where
  uxadt :: a -> UxADT

----------------------------------------------------------------
-- Default membership in ToUxADT.

instance ToUxADT Bool where
  uxadt = B

instance ToUxADT Int where
  uxadt = I

instance ToUxADT Float where
  uxadt = F

instance ToUxADT Double where
  uxadt = D

instance ToUxADT a => ToUxADT [a] where
  uxadt l = L $ map uxadt l

instance ToUxADT a => ToUxADT (Maybe a) where
  uxadt m = maybe None uxadt m

----------------------------------------------------------------
-- Conversion to Javascript in ASCII string representation.

instance Show UxADT where
  show u = to "" u where
    to ind u = case u of
      B b    -> show b
      I i    -> show i
      F f    -> show f
      D d    -> show d
      S s    -> "\"" ++ s ++ "\""
      V v    -> "uxadt.V(\"" ++ v ++ "\")"
      C c us -> "uxadt.C(\"" ++ c ++ "\", [" ++ join ", " [show u | u <- us] ++ "])"
      L   us -> "[" ++ join ", " [show u | u <- us] ++ "]"
      None   -> "uxadt.None"

----------------------------------------------------------------
-- Other useful functions.

javaScriptModule :: String -> UxADT -> String
javaScriptModule name u = 
  "var " ++ name ++ " = (function(){return " ++ show u ++ ";})();"

--eof
